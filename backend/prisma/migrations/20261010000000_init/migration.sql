CREATE TYPE "UserRole" AS ENUM (
  'SYSTEM_ADMINISTRATOR',
  'HOSPITAL_ADMINISTRATOR',
  'HR_OFFICER',
  'PAYROLL_OFFICER',
  'ACCOUNTANT',
  'DEPARTMENT_MANAGER',
  'EMPLOYEE'
);

CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');
CREATE TYPE "EmploymentType" AS ENUM ('PERMANENT', 'CONTRACT', 'TEMPORARY', 'PART_TIME', 'PROBATIONARY', 'OTHER');
CREATE TYPE "EmployeeStatus" AS ENUM ('ACTIVE', 'ON_LEAVE', 'SUSPENDED', 'RESIGNED', 'TERMINATED', 'RETIRED', 'DECEASED');
CREATE TYPE "PayrollStatus" AS ENUM ('DRAFT', 'CALCULATED', 'UNDER_REVIEW', 'APPROVED', 'FINALIZED', 'PARTIALLY_PAID', 'PAID', 'CANCELLED', 'REVERSED');
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
CREATE TYPE "LeaveTypeName" AS ENUM ('ANNUAL', 'SICK', 'MATERNITY', 'PATERNITY', 'COMPASSIONATE', 'UNPAID', 'OFFICIAL', 'OTHER');
CREATE TYPE "PaymentMethod" AS ENUM ('BANK_TRANSFER', 'CASH', 'MOBILE_MONEY', 'OTHER');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "username" TEXT NOT NULL,
  "email" TEXT,
  "passwordHash" TEXT NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'EMPLOYEE',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "lastLoginAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE TABLE "Department" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdById" TEXT,
  "updatedById" TEXT,
  CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

CREATE TABLE "Position" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "departmentId" TEXT,
  "employmentCategory" "EmploymentType",
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdById" TEXT,
  "updatedById" TEXT,
  CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Employee" (
  "id" TEXT NOT NULL,
  "employeeNumber" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "middleName" TEXT,
  "lastName" TEXT NOT NULL,
  "gender" "Gender",
  "dateOfBirth" TIMESTAMP(3),
  "phone" TEXT,
  "email" TEXT,
  "address" TEXT,
  "emergencyContactName" TEXT,
  "emergencyContactPhone" TEXT,
  "departmentId" TEXT,
  "positionId" TEXT,
  "employmentType" "EmploymentType" NOT NULL DEFAULT 'PERMANENT',
  "employmentStartDate" TIMESTAMP(3),
  "contractStartDate" TIMESTAMP(3),
  "contractEndDate" TIMESTAMP(3),
  "employmentStatus" "EmployeeStatus" NOT NULL DEFAULT 'ACTIVE',
  "basicSalary" DECIMAL(12,2) NOT NULL,
  "bankName" TEXT,
  "bankAccountDetails" TEXT,
  "cnpsNumber" TEXT,
  "taxId" TEXT,
  "nationalId" TEXT,
  "salaryPaymentMethod" "PaymentMethod" NOT NULL DEFAULT 'BANK_TRANSFER',
  "notes" TEXT,
  "photoUrl" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "userId" TEXT,
  CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Employee_employeeNumber_key" ON "Employee"("employeeNumber");
CREATE UNIQUE INDEX "Employee_userId_key" ON "Employee"("userId");

CREATE TABLE "EmployeeSalaryHistory" (
  "id" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "previousSalary" DECIMAL(12,2) NOT NULL,
  "newSalary" DECIMAL(12,2) NOT NULL,
  "effectiveDate" TIMESTAMP(3) NOT NULL,
  "reason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EmployeeSalaryHistory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SalaryComponent" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "type" TEXT NOT NULL,
  "amount" DECIMAL(12,2),
  "percentage" DECIMAL(8,4),
  "isFixed" BOOLEAN NOT NULL DEFAULT true,
  "taxable" BOOLEAN NOT NULL DEFAULT true,
  "recurring" BOOLEAN NOT NULL DEFAULT true,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "effectiveStart" TIMESTAMP(3),
  "effectiveEnd" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SalaryComponent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EmployeeAllowance" (
  "id" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "percentage" DECIMAL(8,4),
  "isFixed" BOOLEAN NOT NULL DEFAULT true,
  "taxable" BOOLEAN NOT NULL DEFAULT true,
  "recurring" BOOLEAN NOT NULL DEFAULT true,
  "effectiveStart" TIMESTAMP(3) NOT NULL,
  "effectiveEnd" TIMESTAMP(3),
  "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'APPROVED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EmployeeAllowance_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EmployeeDeduction" (
  "id" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "reference" TEXT,
  "amount" DECIMAL(12,2) NOT NULL,
  "recurring" BOOLEAN NOT NULL DEFAULT true,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3),
  "remainingBalance" DECIMAL(12,2),
  "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EmployeeDeduction_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StatutoryRule" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "ruleType" TEXT NOT NULL,
  "description" TEXT,
  "calculationMethod" TEXT NOT NULL,
  "rate" DECIMAL(10,6),
  "fixedAmount" DECIMAL(12,2),
  "minThreshold" DECIMAL(12,2),
  "maxThreshold" DECIMAL(12,2),
  "deductionBase" TEXT,
  "taxExempt" BOOLEAN NOT NULL DEFAULT false,
  "effectiveStart" TIMESTAMP(3) NOT NULL,
  "effectiveEnd" TIMESTAMP(3),
  "source" TEXT,
  "lastVerifiedDate" TIMESTAMP(3),
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StatutoryRule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TaxBracket" (
  "id" TEXT NOT NULL,
  "statutoryRuleId" TEXT NOT NULL,
  "lowerBound" DECIMAL(12,2),
  "upperBound" DECIMAL(12,2),
  "rate" DECIMAL(10,6) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TaxBracket_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PayrollPeriod" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "periodMonth" INTEGER NOT NULL,
  "periodYear" INTEGER NOT NULL,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3) NOT NULL,
  "plannedPaymentDate" TIMESTAMP(3),
  "status" "PayrollStatus" NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PayrollPeriod_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PayrollPeriod_name_key" ON "PayrollPeriod"("name");

CREATE TABLE "Payroll" (
  "id" TEXT NOT NULL,
  "payrollPeriodId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "employeeNumber" TEXT NOT NULL,
  "basicSalary" DECIMAL(12,2) NOT NULL,
  "grossEarnings" DECIMAL(12,2) NOT NULL,
  "taxableSalary" DECIMAL(12,2) NOT NULL,
  "employeeStatutory" DECIMAL(12,2) NOT NULL,
  "internalDeductions" DECIMAL(12,2) NOT NULL,
  "otherDeductions" DECIMAL(12,2) NOT NULL,
  "netSalary" DECIMAL(12,2) NOT NULL,
  "employerContributions" DECIMAL(12,2) NOT NULL,
  "status" "PayrollStatus" NOT NULL DEFAULT 'DRAFT',
  "calculationData" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Payroll_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PayrollLineItem" (
  "id" TEXT NOT NULL,
  "payrollId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "type" TEXT NOT NULL,
  "taxable" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PayrollLineItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PayrollDeduction" (
  "id" TEXT NOT NULL,
  "payrollId" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "isEmployer" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PayrollDeduction_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PayrollApproval" (
  "id" TEXT NOT NULL,
  "payrollId" TEXT NOT NULL,
  "payrollPeriodId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "comments" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PayrollApproval_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PayrollPayment" (
  "id" TEXT NOT NULL,
  "payrollId" TEXT NOT NULL,
  "payrollPeriodId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "netAmountDue" DECIMAL(12,2) NOT NULL,
  "amountPaid" DECIMAL(12,2) NOT NULL,
  "paymentDate" TIMESTAMP(3),
  "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'BANK_TRANSFER',
  "transactionReference" TEXT,
  "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
  "recordedById" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PayrollPayment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LeaveType" (
  "id" TEXT NOT NULL,
  "name" "LeaveTypeName" NOT NULL,
  "description" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LeaveType_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LeaveRequest" (
  "id" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "leaveType" "LeaveTypeName" NOT NULL,
  "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3) NOT NULL,
  "workingDaysRequested" INTEGER NOT NULL,
  "reason" TEXT,
  "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
  "reviewerId" TEXT,
  "approvalDate" TIMESTAMP(3),
  "comments" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LeaveRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LeaveBalance" (
  "id" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "annualEntitlement" INTEGER NOT NULL,
  "accruedLeave" INTEGER NOT NULL,
  "leaveTaken" INTEGER NOT NULL,
  "leaveRemaining" INTEGER NOT NULL,
  "carriedForward" INTEGER NOT NULL,
  "unpaidLeaveDays" INTEGER NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LeaveBalance_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AttendanceRecord" (
  "id" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "scheduledStart" TIMESTAMP(3),
  "scheduledEnd" TIMESTAMP(3),
  "actualStart" TIMESTAMP(3),
  "actualEnd" TIMESTAMP(3),
  "breakDuration" INTEGER,
  "hoursWorked" DECIMAL(6,2),
  "overtimeHours" DECIMAL(6,2),
  "shiftCategory" TEXT,
  "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AttendanceRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Shift" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Shift_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OvertimeRecord" (
  "id" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "overtimeHours" DECIMAL(6,2) NOT NULL,
  "overtimeType" TEXT,
  "approved" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OvertimeRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MedicalBill" (
  "id" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "billReference" TEXT NOT NULL,
  "treatmentDate" TIMESTAMP(3),
  "description" TEXT,
  "totalAmount" DECIMAL(12,2) NOT NULL,
  "amountPaid" DECIMAL(12,2) NOT NULL,
  "outstandingBalance" DECIMAL(12,2) NOT NULL,
  "monthlyDeduction" DECIMAL(12,2) NOT NULL,
  "deductionStartMonth" TIMESTAMP(3),
  "expectedFinalDeductionMonth" TIMESTAMP(3),
  "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
  "approvedById" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MedicalBill_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EmployeeAdvance" (
  "id" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "referenceNumber" TEXT NOT NULL,
  "amountRequested" DECIMAL(12,2) NOT NULL,
  "amountApproved" DECIMAL(12,2) NOT NULL,
  "requestDate" TIMESTAMP(3) NOT NULL,
  "approvalDate" TIMESTAMP(3),
  "disbursementDate" TIMESTAMP(3),
  "repaymentSchedule" TEXT,
  "monthlyInstallment" DECIMAL(12,2) NOT NULL,
  "remainingBalance" DECIMAL(12,2) NOT NULL,
  "startPayrollPeriod" TEXT,
  "expectedFinalRepaymentPeriod" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "approverId" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EmployeeAdvance_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EmployeeLoan" (
  "id" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "referenceNumber" TEXT NOT NULL,
  "amountRequested" DECIMAL(12,2) NOT NULL,
  "amountApproved" DECIMAL(12,2) NOT NULL,
  "requestDate" TIMESTAMP(3) NOT NULL,
  "approvalDate" TIMESTAMP(3),
  "disbursementDate" TIMESTAMP(3),
  "repaymentSchedule" TEXT,
  "monthlyInstallment" DECIMAL(12,2) NOT NULL,
  "remainingBalance" DECIMAL(12,2) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "approverId" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EmployeeLoan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LoanRepayment" (
  "id" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "loanId" TEXT,
  "amount" DECIMAL(12,2) NOT NULL,
  "payrollPeriod" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LoanRepayment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Bonus" (
  "id" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "componentType" TEXT NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "effectivePeriod" TEXT,
  "taxTreatment" TEXT,
  "reason" TEXT,
  "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Bonus_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Reimbursement" (
  "id" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "componentType" TEXT NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "effectivePeriod" TEXT,
  "taxTreatment" TEXT,
  "reason" TEXT,
  "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Reimbursement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PayrollAdjustment" (
  "id" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "componentType" TEXT NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "effectivePeriod" TEXT,
  "taxTreatment" TEXT,
  "reason" TEXT,
  "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PayrollAdjustment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "action" TEXT NOT NULL,
  "affectedRecord" TEXT,
  "dateTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "beforeValues" JSONB,
  "afterValues" JSONB,
  "reason" TEXT,
  "correlationId" TEXT,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SystemSetting" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SystemSetting_key_key" ON "SystemSetting"("key");

CREATE TABLE "Document" (
  "id" TEXT NOT NULL,
  "employeeId" TEXT,
  "fileName" TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "fileType" TEXT,
  "uploadedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Notification" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Department" ADD CONSTRAINT "Department_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Department" ADD CONSTRAINT "Department_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Position" ADD CONSTRAINT "Position_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Position" ADD CONSTRAINT "Position_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Position" ADD CONSTRAINT "Position_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EmployeeSalaryHistory" ADD CONSTRAINT "EmployeeSalaryHistory_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EmployeeAllowance" ADD CONSTRAINT "EmployeeAllowance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EmployeeDeduction" ADD CONSTRAINT "EmployeeDeduction_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TaxBracket" ADD CONSTRAINT "TaxBracket_statutoryRuleId_fkey" FOREIGN KEY ("statutoryRuleId") REFERENCES "StatutoryRule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Payroll" ADD CONSTRAINT "Payroll_payrollPeriodId_fkey" FOREIGN KEY ("payrollPeriodId") REFERENCES "PayrollPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Payroll" ADD CONSTRAINT "Payroll_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PayrollLineItem" ADD CONSTRAINT "PayrollLineItem_payrollId_fkey" FOREIGN KEY ("payrollId") REFERENCES "Payroll"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PayrollDeduction" ADD CONSTRAINT "PayrollDeduction_payrollId_fkey" FOREIGN KEY ("payrollId") REFERENCES "Payroll"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PayrollApproval" ADD CONSTRAINT "PayrollApproval_payrollId_fkey" FOREIGN KEY ("payrollId") REFERENCES "Payroll"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PayrollApproval" ADD CONSTRAINT "PayrollApproval_payrollPeriodId_fkey" FOREIGN KEY ("payrollPeriodId") REFERENCES "PayrollPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PayrollApproval" ADD CONSTRAINT "PayrollApproval_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PayrollPayment" ADD CONSTRAINT "PayrollPayment_payrollId_fkey" FOREIGN KEY ("payrollId") REFERENCES "Payroll"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PayrollPayment" ADD CONSTRAINT "PayrollPayment_payrollPeriodId_fkey" FOREIGN KEY ("payrollPeriodId") REFERENCES "PayrollPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PayrollPayment" ADD CONSTRAINT "PayrollPayment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PayrollPayment" ADD CONSTRAINT "PayrollPayment_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "LeaveBalance" ADD CONSTRAINT "LeaveBalance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OvertimeRecord" ADD CONSTRAINT "OvertimeRecord_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MedicalBill" ADD CONSTRAINT "MedicalBill_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EmployeeAdvance" ADD CONSTRAINT "EmployeeAdvance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EmployeeLoan" ADD CONSTRAINT "EmployeeLoan_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Bonus" ADD CONSTRAINT "Bonus_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Reimbursement" ADD CONSTRAINT "Reimbursement_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PayrollAdjustment" ADD CONSTRAINT "PayrollAdjustment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Document" ADD CONSTRAINT "Document_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Document" ADD CONSTRAINT "Document_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
