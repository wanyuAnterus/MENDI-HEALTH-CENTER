import express from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/', requireRole('SYSTEM_ADMINISTRATOR', 'HOSPITAL_ADMINISTRATOR', 'HR_OFFICER', 'PAYROLL_OFFICER', 'ACCOUNTANT'), async (_req, res) => {
  const settings = await prisma.systemSetting.findMany({ orderBy: { key: 'asc' } });
  res.json({ data: settings });
});

router.post('/', requireRole('SYSTEM_ADMINISTRATOR'), async (req, res) => {
  const { key, value } = req.body;

  if (!key || !value) {
    return res.status(400).json({ message: 'Key and value are required.' });
  }

  const setting = await prisma.systemSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });

  await prisma.auditLog.create({
    data: {
      userId: req.user.id,
      action: 'SYSTEM_SETTING_UPDATED',
      affectedRecord: setting.id,
      beforeValues: null,
      afterValues: { key, value },
      reason: 'System configuration update',
    },
  });

  res.status(201).json({ data: setting });
});

export default router;
