import express from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authenticate);

router.get('/', requireRole('SYSTEM_ADMINISTRATOR', 'HOSPITAL_ADMINISTRATOR', 'PAYROLL_OFFICER', 'ACCOUNTANT', 'HR_OFFICER'), async (_req, res) => {
  const components = await prisma.salaryComponent.findMany({
    orderBy: { name: 'asc' },
  });

  res.json({ data: components });
});

router.post('/', requireRole('SYSTEM_ADMINISTRATOR', 'HOSPITAL_ADMINISTRATOR', 'PAYROLL_OFFICER'), async (req, res) => {
  const { name, description, type, amount, percentage, isFixed, taxable, recurring } = req.body;

  if (!name || !type) {
    return res.status(400).json({ message: 'Name and type are required.' });
  }

  const component = await prisma.salaryComponent.create({
    data: {
      name,
      description,
      type,
      amount: amount ? Number(amount) : null,
      percentage: percentage ? Number(percentage) : null,
      isFixed: typeof isFixed === 'boolean' ? isFixed : true,
      taxable: typeof taxable === 'boolean' ? taxable : true,
      recurring: typeof recurring === 'boolean' ? recurring : true,
      isActive: true,
    },
  });

  res.status(201).json({ data: component });
});

export default router;
