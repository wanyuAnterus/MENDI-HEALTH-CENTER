import express from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/requests', requireRole('SYSTEM_ADMINISTRATOR', 'HOSPITAL_ADMINISTRATOR', 'HR_OFFICER', 'DEPARTMENT_MANAGER', 'EMPLOYEE'), async (req, res) => {
  const where = req.user.role === 'EMPLOYEE' ? { employee: { userId: req.user.id } } : {};
  const requests = await prisma.leaveRequest.findMany({
    where,
    include: { employee: true },
    orderBy: { requestDate: 'desc' },
  });

  res.json({ data: requests });
});

router.post('/requests', requireRole('EMPLOYEE', 'HR_OFFICER', 'HOSPITAL_ADMINISTRATOR'), async (req, res) => {
  const { employeeId, leaveType, startDate, endDate, reason, workingDaysRequested } = req.body;

  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!employee) {
    return res.status(404).json({ message: 'Employee not found.' });
  }

  const request = await prisma.leaveRequest.create({
    data: {
      employeeId,
      leaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      workingDaysRequested: Number(workingDaysRequested || 1),
      reason,
      approvalStatus: 'PENDING',
    },
  });

  res.status(201).json({ data: request });
});

router.post('/requests/:id/approve', requireRole('SYSTEM_ADMINISTRATOR', 'HOSPITAL_ADMINISTRATOR', 'HR_OFFICER'), async (req, res) => {
  const request = await prisma.leaveRequest.update({
    where: { id: req.params.id },
    data: {
      approvalStatus: 'APPROVED',
      approvalDate: new Date(),
      reviewerId: req.user.id,
      comments: req.body.comments || 'Approved',
    },
  });

  res.json({ data: request });
});

export default router;
