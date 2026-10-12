import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  const user = await prisma.user.findUnique({ where: { username } });

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  if (!user.isActive) {
    return res.status(403).json({ message: 'This account is disabled.' });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const token = jwt.sign(
    { sub: user.id, username: user.username, role: user.role },
    env.JWT_SECRET,
    { expiresIn: '8h' },
  );

  return res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    },
  });
});

router.get('/me', authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });

  res.json({ user });
});

router.post('/change-password', authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword || newPassword.length < 8) {
    return res.status(400).json({ message: 'Current password and a new password of at least 8 characters are required.' });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  const matches = await bcrypt.compare(currentPassword, user.passwordHash);

  if (!matches) {
    return res.status(400).json({ message: 'Current password is invalid.' });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  res.json({ message: 'Password updated successfully.' });
});

export default router;
