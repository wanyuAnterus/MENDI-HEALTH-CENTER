import express from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authenticate);

router.get('/summary', requireRole('SYSTEM_ADMINISTRATOR', 'HOSPITAL_ADMINISTRATOR', 'PAYROLL_OFFICER', 'ACCOUNTANT', 'HR_OFFICER'), async (_req, res) => {
  const [employees, periods, leaveRequests, settings] = await Promise.all([
    prisma.employee.findMany(),
    prisma.payrollPeriod.findMany({ orderBy: { startDate: 'desc' } }),
    prisma.leaveRequest.findMany({ where: { approvalStatus: 'PENDING' } }),
    prisma.systemSetting.findMany(),
  ]);

  const totalBasicSalaries = employees.reduce((sum, employee) => sum + Number(employee.basicSalary || 0), 0);
  const currentPayrollPeriod = periods[0] || null;

  res.json({
    data: {
      totalActiveEmployees: employees.filter((employee) => employee.employmentStatus === 'ACTIVE').length,
      totalEmployees: employees.length,
      pendingLeaveRequests: leaveRequests.length,
      totalBasicSalaries,
      currentPayrollPeriod: currentPayrollPeriod ? currentPayrollPeriod.name : 'Not created',
      settingsCount: settings.length,
    },
  });
});

router.get('/payroll-summary', requireRole('SYSTEM_ADMINISTRATOR', 'HOSPITAL_ADMINISTRATOR', 'PAYROLL_OFFICER', 'ACCOUNTANT'), async (_req, res) => {
  const [employees, periods] = await Promise.all([
    prisma.employee.findMany(),
    prisma.payrollPeriod.findMany({ orderBy: { startDate: 'desc' } }),
  ]);

  const totalBasic = employees.reduce((sum, employee) => sum + Number(employee.basicSalary || 0), 0);

  res.json({
    data: {
      totalBasicSalaries: totalBasic,
      totalEmployees: employees.length,
      currentPeriod: periods[0] ? periods[0].name : 'None',
      currency: 'XAF',
    },
  });
});

export default router;
