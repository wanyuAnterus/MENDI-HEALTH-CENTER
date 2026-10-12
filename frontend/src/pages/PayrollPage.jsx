import { useEffect, useState } from 'react';
import api from '../api';

const defaultPeriod = {
  name: '',
  periodMonth: new Date().getMonth() + 1,
  periodYear: new Date().getFullYear(),
  startDate: '',
  endDate: '',
  plannedPaymentDate: '',
};

export function PayrollPage() {
  const [periods, setPeriods] = useState([]);
  const [periodForm, setPeriodForm] = useState(defaultPeriod);
  const [payrollEntries, setPayrollEntries] = useState([]);
  const [paymentRegister, setPaymentRegister] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchPeriods = async () => {
    try {
      const response = await api.get('/payroll/periods');
      setPeriods(response.data.data || []);
    } catch (error) {
      console.error(error);
      setMessage('Unable to load payroll periods.');
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await api.get('/payroll/payments');
      setPaymentRegister(response.data.data || []);
    } catch (error) {
      console.error(error);
      setMessage('Unable to load the payment register.');
    }
  };

  useEffect(() => {
    fetchPeriods();
    fetchPayments();
  }, []);

  const handleCreatePeriod = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await api.post('/payroll/periods', periodForm);
      setPeriodForm(defaultPeriod);
      setMessage('Payroll period created successfully.');
      fetchPeriods();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to create payroll period.');
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = async (periodId) => {
    setLoading(true);
    try {
      const response = await api.post(`/payroll/periods/${periodId}/calculate`);
      setPayrollEntries(response.data.data || []);
      setMessage('Payroll has been calculated for this period.');
      fetchPeriods();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to calculate payroll.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (periodId) => {
    setLoading(true);
    try {
      await api.post(`/payroll/periods/${periodId}/approve`, { comments: 'Approved from payroll interface.' });
      setMessage('Payroll approved.');
      fetchPeriods();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to approve payroll.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async (periodId) => {
    setLoading(true);
    try {
      await api.post(`/payroll/periods/${periodId}/finalize`);
      setMessage('Payroll finalized.');
      fetchPeriods();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to finalize payroll.');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (periodId) => {
    setLoading(true);
    try {
      await api.post(`/payroll/periods/${periodId}/pay`, { paymentMethod: 'BANK_TRANSFER', notes: 'Payment recorded in payroll interface.' });
      setMessage('Payroll payments recorded.');
      fetchPeriods();
      fetchPayments();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to record payroll payment.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPayslip = async (payrollId) => {
    try {
      const response = await api.get(`/payroll/${payrollId}/payslip`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to generate payslip.');
    }
  };

  return (
    <div className="page-block">
      <div className="section-header">
        <h2>Payroll Periods</h2>
      </div>

      <div className="two-column-grid">
        <form className="panel stacked-form" onSubmit={handleCreatePeriod}>
          <h3>Create payroll period</h3>
          <label>
            Period name
            <input
              value={periodForm.name}
              onChange={(event) => setPeriodForm({ ...periodForm, name: event.target.value })}
              placeholder="June 2026 Payroll"
            />
          </label>

          <div className="two-inline-grid">
            <label>
              Month
              <input
                type="number"
                min="1"
                max="12"
                value={periodForm.periodMonth}
                onChange={(event) => setPeriodForm({ ...periodForm, periodMonth: event.target.value })}
              />
            </label>
            <label>
              Year
              <input
                type="number"
                value={periodForm.periodYear}
                onChange={(event) => setPeriodForm({ ...periodForm, periodYear: event.target.value })}
              />
            </label>
          </div>

          <div className="two-inline-grid">
            <label>
              Start date
              <input
                type="date"
                value={periodForm.startDate}
                onChange={(event) => setPeriodForm({ ...periodForm, startDate: event.target.value })}
              />
            </label>
            <label>
              End date
              <input
                type="date"
                value={periodForm.endDate}
                onChange={(event) => setPeriodForm({ ...periodForm, endDate: event.target.value })}
              />
            </label>
          </div>

          <label>
            Planned payment date
            <input
              type="date"
              value={periodForm.plannedPaymentDate}
              onChange={(event) => setPeriodForm({ ...periodForm, plannedPaymentDate: event.target.value })}
            />
          </label>

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Saving...' : 'Create Period'}
          </button>
        </form>

        <div className="panel">
          <h3>Action status</h3>
          <p>{message || 'Create a payroll period to begin calculations.'}</p>

          {payrollEntries.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Gross</th>
                  <th>Net</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payrollEntries.map((entry) => (
                  <tr key={entry.id || entry.employeeId}>
                    <td>{entry.employeeNumber}</td>
                    <td>{Number(entry.grossEarnings || 0).toLocaleString()} FCFA</td>
                    <td>{Number(entry.netSalary || 0).toLocaleString()} FCFA</td>
                    <td>{entry.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="panel" style={{ marginTop: '20px' }}>
        {periods.length === 0 ? (
          <p>No payroll periods found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Dates</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {periods.map((period) => (
                <tr key={period.id}>
                  <td>{period.name}</td>
                  <td>
                    {new Date(period.startDate).toLocaleDateString()} - {new Date(period.endDate).toLocaleDateString()}
                  </td>
                  <td>{period.status}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button className="primary-button" onClick={() => handleCalculate(period.id)}>Calculate</button>
                      <button className="ghost-button" onClick={() => handleApprove(period.id)}>Approve</button>
                      <button className="ghost-button" onClick={() => handleFinalize(period.id)}>Finalize</button>
                      <button className="ghost-button" onClick={() => handlePay(period.id)}>Pay</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="panel" style={{ marginTop: '20px' }}>
        <h3>Payment register</h3>
        {paymentRegister.length === 0 ? (
          <p>No payment entries yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Period</th>
                <th>Net Due</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paymentRegister.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.employee?.firstName || 'Employee'} {payment.employee?.lastName || ''}</td>
                  <td>{payment.payrollPeriod?.name || 'N/A'}</td>
                  <td>{Number(payment.amountPaid || payment.netAmountDue || 0).toLocaleString()} FCFA</td>
                  <td>{payment.paymentStatus}</td>
                  <td>
                    <button className="ghost-button" onClick={() => handleDownloadPayslip(payment.payrollId)}>
                      Payslip
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
