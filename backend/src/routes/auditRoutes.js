import express from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authenticate);

router.get('/logs', requireRole('SYSTEM_ADMINISTRATOR', 'HOSPITAL_ADMINISTRATOR', 'PAYROLL_OFFICER', 'ACCOUNTANT', 'HR_OFFICER'), async (_req, res) => {
  const logs = await prisma.auditLog.findMany({
    orderBy: { dateTime: 'desc' },
    include: { user: { select: { username: true, role: true } } },
    take: 100,
  });

  res.json({ data: logs });
});

export default router;
