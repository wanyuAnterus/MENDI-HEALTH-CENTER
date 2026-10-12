import Decimal from 'decimal.js';

const toDecimal = (value) => new Decimal(value ?? 0);

export const DEFAULT_STATUTORY_RULES = [
  {
    name: 'CNPS Employee Contribution',
    ruleType: 'EMPLOYEE_DEDUCTION',
    calculationMethod: 'PERCENTAGE',
    rate: '0.04',
    description: 'Employee CNPS contribution. Verify against current Cameroonian code before payroll finalization.',
    source: 'Configuration template; verify against the official Cameroonian legal source before production use.',
    taxExempt: false,
  },
  {
    name: 'CNPS Employer Contribution',
    ruleType: 'EMPLOYER_CONTRIBUTION',
    calculationMethod: 'PERCENTAGE',
    rate: '0.08',
    description: 'Employer contribution to CNPS. Verify against current Cameroonian code before payroll finalization.',
    source: 'Configuration template; verify against the official Cameroonian legal source before production use.',
    taxExempt: false,
  },
  {
    name: 'Payroll Tax',
    ruleType: 'INCOME_TAX',
    calculationMethod: 'PERCENTAGE',
    rate: '0.05',
    description: 'Placeholder payroll tax rate to be validated against official tax tables.',
    source: 'Configuration template; verify against the official Cameroonian legal source before production use.',
    taxExempt: false,
  },
];

export function calculateGross({
  basicSalary,
  allowances = [],
  overtime = '0',
  bonuses = '0',
  otherEarnings = '0',
}) {
  const totalAllowances = allowances.reduce(
    (sum, item) => sum.plus(toDecimal(item.amount || 0)),
    new Decimal(0),
  );

  return toDecimal(basicSalary)
    .plus(totalAllowances)
    .plus(toDecimal(overtime))
    .plus(toDecimal(bonuses))
    .plus(toDecimal(otherEarnings));
}

export function calculateNet({ grossEarnings, employeeStatutory = '0', internalDeductions = '0', otherDeductions = '0' }) {
  return toDecimal(grossEarnings)
    .minus(toDecimal(employeeStatutory))
    .minus(toDecimal(internalDeductions))
    .minus(toDecimal(otherDeductions));
}

export function calculateLeavePay({ basicSalary, divisor = 16, days = 1 }) {
  return toDecimal(basicSalary).div(divisor).mul(toDecimal(days));
}

export function calculatePayrollSummary({
  basicSalary,
  allowances = [],
  overtime = '0',
  bonuses = '0',
  otherEarnings = '0',
  employeeStatutory = '0',
  internalDeductions = '0',
  otherDeductions = '0',
}) {
  const grossEarnings = calculateGross({
    basicSalary,
    allowances,
    overtime,
    bonuses,
    otherEarnings,
  });

  const taxableSalary = calculateTaxableSalary({ grossEarnings: grossEarnings.toString() });
  const employeeStatutoryValue = toDecimal(employeeStatutory);
  const internalDeductionsValue = toDecimal(internalDeductions);
  const otherDeductionsValue = toDecimal(otherDeductions);
  const netSalary = calculateNet({
    grossEarnings: grossEarnings.toString(),
    employeeStatutory: employeeStatutoryValue.toString(),
    internalDeductions: internalDeductionsValue.toString(),
    otherDeductions: otherDeductionsValue.toString(),
  });

  return {
    grossEarnings,
    taxableSalary,
    employeeStatutory: employeeStatutoryValue,
    internalDeductions: internalDeductionsValue,
    otherDeductions: otherDeductionsValue,
    netSalary,
  };
}

export function buildPayslipSummary({
  employee,
  payrollPeriod,
  basicSalary,
  grossEarnings,
  employeeStatutory,
  internalDeductions,
  otherDeductions,
  netSalary,
}) {
  const employeeName = [employee?.firstName, employee?.lastName].filter(Boolean).join(' ') || 'Employee';

  return {
    employeeName,
    employeeNumber: employee?.employeeNumber || 'N/A',
    periodName: payrollPeriod?.name || 'Payroll period',
    basicSalary: toDecimal(basicSalary || 0),
    grossEarnings: toDecimal(grossEarnings || 0),
    employeeStatutory: toDecimal(employeeStatutory || 0),
    internalDeductions: toDecimal(internalDeductions || 0),
    otherDeductions: toDecimal(otherDeductions || 0),
    netSalary: toDecimal(netSalary || 0),
  };
}

export function calculatePaymentRegisterTotal(payments = []) {
  return payments.reduce((sum, payment) => {
    const amount = Number(payment?.amountPaid ?? payment?.netAmountDue ?? 0);
    return sum + amount;
  }, 0);
}

export function calculateTaxableSalary({ grossEarnings, nonTaxable = '0' }) {
  return toDecimal(grossEarnings).minus(toDecimal(nonTaxable));
}
