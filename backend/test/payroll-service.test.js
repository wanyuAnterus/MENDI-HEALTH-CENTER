import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateGross,
  calculateNet,
  calculateLeavePay,
  calculatePayrollSummary,
  buildPayslipSummary,
} from '../src/services/payrollService.js';

test('calculates gross salary with fixed allowances and overtime', () => {
  const gross = calculateGross({
    basicSalary: '250000',
    allowances: [{ amount: '50000' }, { amount: '20000' }],
    overtime: '15000',
    bonuses: '10000',
    otherEarnings: '5000',
  });

  assert.equal(gross.toString(), '350000');
});

test('calculates net salary after statutory and internal deductions', () => {
  const net = calculateNet({
    grossEarnings: '350000',
    employeeStatutory: '25000',
    internalDeductions: '20000',
    otherDeductions: '5000',
  });

  assert.equal(net.toString(), '300000');
});

test('calculates annual leave pay using the configured divisor of 16 and leave days', () => {
  const leavePay = calculateLeavePay({ basicSalary: '320000', divisor: 16, days: 3 });
  assert.equal(leavePay.toString(), '60000');
});

test('calculates a payroll summary from gross and deductions', () => {
  const summary = calculatePayrollSummary({
    basicSalary: '300000',
    allowances: [{ amount: '50000' }, { amount: '25000' }],
    overtime: '15000',
    bonuses: '20000',
    otherEarnings: '5000',
    employeeStatutory: '25000',
    internalDeductions: '15000',
    otherDeductions: '5000',
  });

  assert.equal(summary.grossEarnings.toString(), '415000');
  assert.equal(summary.netSalary.toString(), '370000');
});

test('builds a payslip summary with employee and deduction totals', () => {
  const payslip = buildPayslipSummary({
    employee: { firstName: 'Amina', lastName: 'Ndi', employeeNumber: 'EMP-001' },
    payrollPeriod: { name: 'June 2026' },
    basicSalary: '320000',
    grossEarnings: '380000',
    employeeStatutory: '20000',
    internalDeductions: '15000',
    otherDeductions: '5000',
    netSalary: '340000',
  });

  assert.equal(payslip.employeeName, 'Amina Ndi');
  assert.equal(payslip.employeeNumber, 'EMP-001');
  assert.equal(payslip.periodName, 'June 2026');
  assert.equal(payslip.netSalary.toString(), '340000');
});
