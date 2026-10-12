import express from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';
import { DEFAULT_STATUTORY_RULES } from '../services/payrollService.js';

const router = express.Router();
router.use(authenticate);

router.get('/defaults', requireRole('SYSTEM_ADMINISTRATOR', 'HOSPITAL_ADMINISTRATOR', 'PAYROLL_OFFICER', 'ACCOUNTANT'), async (_req, res) => {
  res.json({ data: DEFAULT_STATUTORY_RULES });
});

router.get('/rules', requireRole('SYSTEM_ADMINISTRATOR', 'HOSPITAL_ADMINISTRATOR', 'PAYROLL_OFFICER', 'ACCOUNTANT'), async (_req, res) => {
  const rules = await prisma.statutoryRule.findMany({
    orderBy: { effectiveStart: 'desc' },
    include: { taxBrackets: true },
  });

  res.json({ data: rules });
});

router.post('/rules', requireRole('SYSTEM_ADMINISTRATOR', 'HOSPITAL_ADMINISTRATOR', 'PAYROLL_OFFICER'), async (req, res) => {
  const { name, ruleType, calculationMethod, description, rate, fixedAmount, effectiveStart, source } = req.body;

  if (!name || !ruleType || !calculationMethod || !effectiveStart) {
    return res.status(400).json({ message: 'Rule name, type, calculation method, and effective start date are required.' });
  }

  const rule = await prisma.statutoryRule.create({
    data: {
      name,
      ruleType,
      calculationMethod,
      description: description || 'Configurable statutory rule pending formal verification.',
      rate: rate ? Number(rate) : null,
      fixedAmount: fixedAmount ? Number(fixedAmount) : null,
      effectiveStart: new Date(effectiveStart),
      source: source || 'Official Cameroonian legal sources must be cross-checked before final payroll approval.',
      isActive: true,
    },
    include: { taxBrackets: true },
  });

  res.status(201).json({ data: rule });
});

export default router;
