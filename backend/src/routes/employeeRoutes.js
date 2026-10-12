import express from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/', requireRole('SYSTEM_ADMINISTRATOR', 'HOSPITAL_ADMINISTRATOR', 'HR_OFFICER', 'PAYROLL_OFFICER', 'ACCOUNTANT', 'DEPARTMENT_MANAGER', 'EMPLOYEE'), async (req, res) => {
  const employees = await prisma.employee.findMany({
    include: {
      department: true,
      position: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ data: employees });
});

router.post('/', requireRole('SYSTEM_ADMINISTRATOR', 'HOSPITAL_ADMINISTRATOR', 'HR_OFFICER'), async (req, res) => {
  const { employeeNumber, firstName, lastName, basicSalary, departmentId, positionId, email } = req.body;

  if (!employeeNumber || !firstName || !lastName || !basicSalary) {
    return res.status(400).json({ message: 'Employee number, name, and basic salary are required.' });
  }

  const existing = await prisma.employee.findUnique({ where: { employeeNumber } });
  if (existing) {
    return res.status(409).json({ message: 'Employee number is already in use.' });
  }

  const employee = await prisma.employee.create({
    data: {
      employeeNumber,
      firstName,
      lastName,
      email,
      basicSalary: Number(basicSalary),
      departmentId,
      positionId,
      employmentStatus: 'ACTIVE',
      employmentType: req.body.employmentType || 'PERMANENT',
      phone: req.body.phone,
      address: req.body.address,
      salaryPaymentMethod: req.body.salaryPaymentMethod || 'BANK_TRANSFER',
    },
    include: { department: true, position: true },
  });

  await prisma.auditLog.create({
    data: {
      userId: req.user.id,
      action: 'EMPLOYEE_CREATED',
      affectedRecord: employee.id,
      beforeValues: null,
      afterValues: { employeeNumber: employee.employeeNumber, employeeId: employee.id },
      reason: 'Employee registration',
    },
  });

  res.status(201).json({ data: employee });
});

router.get('/:id', requireRole('SYSTEM_ADMINISTRATOR', 'HOSPITAL_ADMINISTRATOR', 'HR_OFFICER', 'PAYROLL_OFFICER', 'ACCOUNTANT', 'DEPARTMENT_MANAGER', 'EMPLOYEE'), async (req, res) => {
  const employee = await prisma.employee.findUnique({
    where: { id: req.params.id },
    include: { department: true, position: true, salaryHistory: true },
  });

  if (!employee) {
    return res.status(404).json({ message: 'Employee not found.' });
  }

  if (req.user.role === 'EMPLOYEE' && req.user.id !== employee.userId) {
    return res.status(403).json({ message: 'You can only view your own profile.' });
  }

  res.json({ data: employee });
});

router.put('/:id', requireRole('SYSTEM_ADMINISTRATOR', 'HOSPITAL_ADMINISTRATOR', 'HR_OFFICER'), async (req, res) => {
  const employee = await prisma.employee.update({
    where: { id: req.params.id },
    data: {
      ...req.body,
      basicSalary: req.body.basicSalary ? Number(req.body.basicSalary) : undefined,
    },
    include: { department: true, position: true },
  });

  res.json({ data: employee });
});

export default router;
