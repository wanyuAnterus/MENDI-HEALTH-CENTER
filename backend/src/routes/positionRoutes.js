import express from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authenticate);

router.get('/', requireRole('SYSTEM_ADMINISTRATOR', 'HOSPITAL_ADMINISTRATOR', 'HR_OFFICER', 'PAYROLL_OFFICER', 'DEPARTMENT_MANAGER'), async (_req, res) => {
  const positions = await prisma.position.findMany({
    include: { department: true },
    orderBy: { name: 'asc' },
  });

  res.json({ data: positions });
});

router.post('/', requireRole('SYSTEM_ADMINISTRATOR', 'HOSPITAL_ADMINISTRATOR', 'HR_OFFICER'), async (req, res) => {
  const { name, description, departmentId, employmentCategory } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Position name is required.' });
  }

  const position = await prisma.position.create({
    data: {
      name,
      description,
      departmentId,
      employmentCategory: employmentCategory || 'PERMANENT',
    },
    include: { department: true },
  });

  res.status(201).json({ data: position });
});

export default router;
