import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import positionRoutes from './routes/positionRoutes.js';
import salaryComponentRoutes from './routes/salaryComponentRoutes.js';
import statutoryRoutes from './routes/statutoryRoutes.js';
import payrollRoutes from './routes/payrollRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import auditRoutes from './routes/auditRoutes.js';

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.get('/api/health', (_, res) => {
  res.json({ ok: true, message: 'MENDI Health Center Payroll API is running.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/positions', positionRoutes);
app.use('/api/salary-components', salaryComponentRoutes);
app.use('/api/statutory', statutoryRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audit', auditRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal server error',
  });
});

export default app;
