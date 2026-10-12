import express from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/', requireRole('SYSTEM_ADMINISTRATOR', 'HOSPITAL_ADMINISTRATOR', 'HR_OFFICER', 'PAYROLL_OFFICER', 'DEPARTMENT_MANAGER'), async (_req, res) => {
  const departments = await prisma.department.findMany({ orderBy: { name: 'asc' } });
  res.json({ data: departments });
});

router.post('/', requireRole('SYSTEM_ADMINISTRATOR', 'HOSPITAL_ADMINISTRATOR', 'HR_OFFICER'), async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Department name is required.' });
  }

  const department = await prisma.department.create({ data: { name, description } });
  res.status(201).json({ data: department });
});

router.put('/:id', requireRole('SYSTEM_ADMINISTRATOR', 'HOSPITAL_ADMINISTRATOR', 'HR_OFFICER'), async (req, res) => {
  const { name, description, isActive } = req.body;

  const department = await prisma.department.update({
    where: { id: req.params.id },
    data: {
      name,
      description,
      isActive,
    },
  });

  res.json({ data: department });
});

export default router;
