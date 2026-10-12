import express from 'express';
import PDFDocument from 'pdfkit';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';
import { buildPayslipSummary, calculateGross, calculateNet, calculatePayrollSummary, calculatePaymentRegisterTotal } from '../services/payrollService.js';

const router = express.Router();

router.use(authenticate);

router.get('/periods', requireRole('SYSTEM_ADMINISTRATOR', 'HOSPITAL_ADMINISTRATOR', 'PAYROLL_OFFICER', 'ACCOUNTANT'), async (_req, res) => {
  const periods = await prisma.payrollPeriod.findMany({ orderBy: { startDate: 'desc' } });
  res.json({ data: periods });
});

router.get('/periods/:id', requireRole('SYSTEM_ADMINISTRATOR', 'HOSPITAL_ADMINISTRATOR', 'PAYROLL_OFFICER', 'ACCOUNTANT'), async (req, res) => {
  const period = await prisma.payrollPeriod.findUnique({
    where: { id: req.params.id },
    include: { payrolls: { include: { employee: true } } },
  });

  if (!period) {
    return res.status(404).json({ message: 'Payroll period not found.' });
  }

  res.json({ data: period });
});

router.get('/payments', requireRole('SYSTEM_ADMINISTRATOR', 'HOSPITAL_ADMINISTRATOR', 'PAYROLL_OFFICER', 'ACCOUNTANT'), async (_req, res) => {
  const payments = await prisma.payrollPayment.findMany({
    include: {
      employee: true,
      payrollPeriod: true,
      payroll: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalPaid = calculatePaymentRegisterTotal(payments.map((payment) => ({ amountPaid: payment.amountPaid.toString() })));

  res.json({
    data: payments,
    summary: {
      totalPaid,
      entries: payments.length,
      currency: 'XAF',
    },
  });
});

router.get('/:id/payslip', requireRole('SYSTEM_ADMINISTRATOR', 'HOSPITAL_ADMINISTRATOR', 'PAYROLL_OFFICER', 'ACCOUNTANT', 'HR_OFFICER', 'EMPLOYEE'), async (req, res) => {
  const payroll = await prisma.payroll.findUnique({
    where: { id: req.params.id },
    include: {
      employee: true,
      payrollPeriod: true,
    },
  });

  if (!payroll) {
    return res.status(404).json({ message: 'Payroll entry not found.' });
  }

  const payslip = buildPayslipSummary({
    employee: payroll.employee,
    payrollPeriod: payroll.payrollPeriod,
    basicSalary: payroll.basicSalary,
    grossEarnings: payroll.grossEarnings,
    employeeStatutory: payroll.employeeStatutory,
    internalDeductions: payroll.internalDeductions,
    otherDeductions: payroll.otherDeductions,
    netSalary: payroll.netSalary,
  });

  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const fileName = `${payroll.employee.employeeNumber || 'payslip'}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);

  doc.pipe(res);
  doc.fontSize(22).text('MENDI HEALTH CENTER', { align: 'center' });
  doc.moveDown();
  doc.fontSize(18).text('Payslip');
  doc.moveDown();
  doc.fontSize(12).text(`Period: ${payslip.periodName}`);
  doc.text(`Employee: ${payslip.employeeName}`);
  doc.text(`Employee Number: ${payslip.employeeNumber}`);
  doc.moveDown();
  doc.text(`Basic Salary: ${Number(payslip.basicSalary).toLocaleString()} FCFA`);
  doc.text(`Gross Earnings: ${Number(payslip.grossEarnings).toLocaleString()} FCFA`);
  doc.text(`Statutory Deductions: ${Number(payslip.employeeStatutory).toLocaleString()} FCFA`);
  doc.text(`Internal Deductions: ${Number(payslip.internalDeductions).toLocaleString()} FCFA`);
  doc.text(`Other Deductions: ${Number(payslip.otherDeductions).toLocaleString()} FCFA`);
  doc.moveDown();
  doc.fontSize(16).text(`Net Salary: ${Number(payslip.netSalary).toLocaleString()} FCFA`);
  doc.end();
});

router.post('/periods', requireRole('SYSTEM_ADMINISTRATOR', 'HOSPITAL_ADMINISTRATOR', 'PAYROLL_OFFICER'), async (req, res) => {
  const { name, periodMonth, periodYear, startDate, endDate, plannedPaymentDate } = req.body;

  if (!name || !periodMonth || !periodYear || !startDate || !endDate) {
    return res.status(400).json({ message: 'Payroll period details are incomplete.' });
  }

  const period = await prisma.payrollPeriod.create({
    data: {
      name,
      periodMonth: Number(periodMonth),
      periodYear: Number(periodYear),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      plannedPaymentDate: plannedPaymentDate ? new Date(plannedPaymentDate) : null,
    },
  });

  res.status(201).json({ data: period });
});

router.post('/periods/:id/calculate', requireRole('SYSTEM_ADMINISTRATOR', 'HOSPITAL_ADMINISTRATOR', 'PAYROLL_OFFICER'), async (req, res) => {
  const period = await prisma.payrollPeriod.findUnique({ where: { id: req.params.id } });
  if (!period) {
    return res.status(404).json({ message: 'Payroll period not found.' });
  }

  const employees = await prisma.employee.findMany({ include: { allowances: true } });

  const payrollEntries = await Promise.all(
    employees.map(async (employee) => {
      const allowances = employee.allowances.filter((allowance) => allowance.approvalStatus === 'APPROVED');
      const totalAllowances = allowances.reduce((sum, allowance) => sum + Number(allowance.amount || 0), 0);
      const gross = calculateGross({
        basicSalary: employee.basicSalary.toString(),
        allowances: allowances.map((allowance) => ({ amount: allowance.amount.toString() })),
        overtime: '0',
        bonuses: '0',
        otherEarnings: '0',
      });

      const employeeStatutory = totalAllowances > 0 ? gross.mul(0.04).toString() : '0';
      const internalDeductions = '0';
      const summary = calculatePayrollSummary({
        basicSalary: employee.basicSalary.toString(),
        allowances: allowances.map((allowance) => ({ amount: allowance.amount.toString() })),
        overtime: '0',
        bonuses: '0',
        otherEarnings: '0',
        employeeStatutory,
        internalDeductions,
        otherDeductions: '0',
      });

      const existingPayroll = await prisma.payroll.findFirst({
        where: { payrollPeriodId: period.id, employeeId: employee.id },
      });

      const payrollEntry = existingPayroll
        ? await prisma.payroll.update({
            where: { id: existingPayroll.id },
            data: {
              employeeNumber: employee.employeeNumber,
              basicSalary: employee.basicSalary,
              grossEarnings: summary.grossEarnings,
              taxableSalary: summary.taxableSalary,
              employeeStatutory: summary.employeeStatutory,
              internalDeductions: summary.internalDeductions,
              otherDeductions: summary.otherDeductions,
              netSalary: summary.netSalary,
              status: 'CALCULATED',
              calculationData: {
                allowancesTotal: totalAllowances,
                rulesApplied: ['CNPS Employee Contribution'],
              },
            },
          })
        : await prisma.payroll.create({
            data: {
              payrollPeriodId: period.id,
              employeeId: employee.id,
              employeeNumber: employee.employeeNumber,
              basicSalary: employee.basicSalary,
              grossEarnings: summary.grossEarnings,
              taxableSalary: summary.taxableSalary,
              employeeStatutory: summary.employeeStatutory,
              internalDeductions: summary.internalDeductions,
              otherDeductions: summary.otherDeductions,
              netSalary: summary.netSalary,
              status: 'CALCULATED',
              employerContributions: '0',
              calculationData: {
                allowancesTotal: totalAllowances,
                rulesApplied: ['CNPS Employee Contribution'],
              },
            },
          });

      await prisma.payrollApproval.create({
        data: {
          payrollId: payrollEntry.id,
          payrollPeriodId: period.id,
          userId: req.user.id,
          action: 'CALCULATED',
          comments: 'Payroll calculated and stored for review.',
        },
      });

      return {
        id: payrollEntry.id,
        employeeId: employee.id,
        employeeNumber: employee.employeeNumber,
        basicSalary: payrollEntry.basicSalary,
        grossEarnings: payrollEntry.grossEarnings.toString(),
        netSalary: payrollEntry.netSalary.toString(),
        status: payrollEntry.status,
      };
    }),
  );

  await prisma.payrollPeriod.update({
    where: { id: period.id },
    data: { status: 'CALCULATED' },
  });

  res.json({ data: payrollEntries });
});

router.post('/periods/:id/approve', requireRole('SYSTEM_ADMINISTRATOR', 'HOSPITAL_ADMINISTRATOR', 'PAYROLL_OFFICER'), async (req, res) => {
  const period = await prisma.payrollPeriod.findUnique({ where: { id: req.params.id }, include: { payrolls: true } });
  if (!period) {
    return res.status(404).json({ message: 'Payroll period not found.' });
  }

  const updates = await Promise.all(
    period.payrolls.map(async (payroll) => {
      await prisma.payrollApproval.create({
        data: {
          payrollId: payroll.id,
          payrollPeriodId: period.id,
          userId: req.user.id,
          action: 'APPROVED',
          comments: req.body.comments || 'Approved by payroll authority.',
        },
      });

      return prisma.payroll.update({
        where: { id: payroll.id },
        data: { status: 'APPROVED' },
      });
    }),
  );

  await prisma.payrollPeriod.update({
    where: { id: period.id },
    data: { status: 'APPROVED' },
  });

  res.json({ data: updates });
});

router.post('/periods/:id/finalize', requireRole('SYSTEM_ADMINISTRATOR', 'HOSPITAL_ADMINISTRATOR', 'ACCOUNTANT'), async (req, res) => {
  const period = await prisma.payrollPeriod.findUnique({ where: { id: req.params.id }, include: { payrolls: true } });
  if (!period) {
    return res.status(404).json({ message: 'Payroll period not found.' });
  }

  const updatedPayrolls = await Promise.all(
    period.payrolls.map(async (payroll) => prisma.payroll.update({
      where: { id: payroll.id },
      data: { status: 'FINALIZED' },
    })),
  );

  await prisma.payrollPeriod.update({
    where: { id: period.id },
    data: { status: 'FINALIZED' },
  });

  res.json({ data: updatedPayrolls });
});

router.post('/periods/:id/pay', requireRole('SYSTEM_ADMINISTRATOR', 'HOSPITAL_ADMINISTRATOR', 'ACCOUNTANT'), async (req, res) => {
  const { paymentMethod = 'BANK_TRANSFER', notes = 'Payroll disbursed' } = req.body;
  const period = await prisma.payrollPeriod.findUnique({ where: { id: req.params.id }, include: { payrolls: true } });
  if (!period) {
    return res.status(404).json({ message: 'Payroll period not found.' });
  }

  const paymentRecords = await Promise.all(
    period.payrolls.map(async (payroll) => {
      const payment = await prisma.payrollPayment.create({
        data: {
          payrollId: payroll.id,
          payrollPeriodId: period.id,
          employeeId: payroll.employeeId,
          netAmountDue: payroll.netSalary,
          amountPaid: payroll.netSalary,
          paymentDate: new Date(),
          paymentMethod,
          paymentStatus: 'PAID',
          recordedById: req.user.id,
          notes,
        },
      });

      await prisma.payroll.update({
        where: { id: payroll.id },
        data: { status: 'PAID' },
      });

      return payment;
    }),
  );

  res.json({ data: paymentRecords });
});

router.get('/payslips', requireRole('SYSTEM_ADMINISTRATOR', 'HOSPITAL_ADMINISTRATOR', 'PAYROLL_OFFICER', 'ACCOUNTANT', 'HR_OFFICER', 'EMPLOYEE'), async (_req, res) => {
  const payrolls = await prisma.payroll.findMany({
    include: {
      employee: true,
      payrollPeriod: true,
    },
    orderBy: { updatedAt: 'desc' },
  });

  const data = payrolls.map((payroll) => ({
    id: payroll.id,
    employeeNumber: payroll.employeeNumber,
    employeeName: `${payroll.employee?.firstName || ''} ${payroll.employee?.lastName || ''}`.trim(),
    periodName: payroll.payrollPeriod?.name || 'Unknown period',
    netSalary: payroll.netSalary,
  }));

  res.json({ data });
});

export default router;
