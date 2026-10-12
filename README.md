# MENDI HEALTH CENTER Payroll Management System

This project is a full-stack payroll management application for MENDI HEALTH CENTER in Cameroon. It includes employee records, departments, salary components, payroll periods, leave management, payroll approval, configurable statutory rules, audit logs, and reports.

## Tech stack

- Frontend: React + Vite
- Backend: Node.js + Express.js
- Database: PostgreSQL + Prisma ORM
- Authentication: JWT + bcryptjs
- Payroll calculations: Decimal.js service layer
- Security: Helmet, CORS, rate limiting

## Project structure

- backend/: Express API, Prisma schema, payroll logic, auth, routes
- frontend/: React application for HR and payroll workflows
- README.md: project setup and run guide

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm
- Local PostgreSQL access with a valid database user and password

## 1) Install dependencies

From the workspace root:

- npm install
- npm install --prefix backend
- npm install --prefix frontend

## 2) Configure environment files

Create or update the backend environment variables with your local PostgreSQL connection:

- backend/.env

Example:

- DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/hospital_payroll?schema=public"
- JWT_SECRET="change-this-secret"
- PORT=5000
- CORS_ORIGIN="http://localhost:5173"

## 3) Create the database

On your local PostgreSQL instance:

- Create a database named `hospital_payroll`
- Ensure your user can access it with the configured password

If needed, use:

- createdb -U postgres hospital_payroll

## 4) Run Prisma migration

From the backend folder:

- cd backend
- npx prisma migrate dev --name init

This creates the tables for users, employees, payroll periods, leave records, statutory rules, and payments.

## 5) Initialize the admin user

From the backend folder:

- node src/scripts/initAdmin.js admin Admin@123 admin@mendihealth.org

Use that account for the first login.

## 6) Start the application

Backend:

- cd backend
- npm run dev

Frontend:

- cd frontend
- npm run dev -- --host 0.0.0.0

The app will typically be available at:

- Backend: http://localhost:5000/api/health
- Frontend: http://localhost:5173

## 7) Current payroll workflow

The application supports the core operational cycle:

- Create employees, departments, and positions
- Configure salary components and allowances
- Create payroll periods
- Calculate payroll entries for employees
- Approve payrolls and finalize them
- Record payment settlements and payslip-related reports
- Review statutory rules and audit logs

## 8) Important notes

- Payroll statutory settings are configurable and should be checked against the latest official Cameroonian legal sources before production use.
- The project is structured for extension into stronger leave, audit, and reporting controls.
- The backend and frontend can be started independently, but the app is intended to run together for the full payroll workflow.

## 9) Verification

Use these checks to validate the project is working:

- Backend health endpoint: http://localhost:5000/api/health
- Frontend dev server: http://localhost:5173
- Backend tests: cd backend && npm test

## Local credentials in this workspace

The local project uses your configured PostgreSQL password in the backend environment file, while the database name remains `hospital_payroll`.
