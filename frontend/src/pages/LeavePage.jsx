import { useEffect, useState } from 'react';
import api from '../api';

export function LeavePage() {
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState({ employeeId: '', leaveType: 'ANNUAL', startDate: '', endDate: '', workingDaysRequested: '1', reason: '' });

  const fetchRequests = async () => {
    const response = await api.get('/leave/requests');
    setRequests(response.data.data || []);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await api.post('/leave/requests', form);
    setForm({ employeeId: '', leaveType: 'ANNUAL', startDate: '', endDate: '', workingDaysRequested: '1', reason: '' });
    fetchRequests();
  };

  return (
    <div className="page-block">
      <div className="section-header">
        <h2>Leave Management</h2>
      </div>

      <div className="two-column-grid">
        <form className="panel stacked-form" onSubmit={handleSubmit}>
          <label>
            Employee ID
            <input value={form.employeeId} onChange={(event) => setForm({ ...form, employeeId: event.target.value })} />
          </label>

          <label>
            Leave Type
            <select value={form.leaveType} onChange={(event) => setForm({ ...form, leaveType: event.target.value })}>
              <option value="ANNUAL">Annual</option>
              <option value="SICK">Sick</option>
              <option value="MATERNITY">Maternity</option>
              <option value="PATERNITY">Paternity</option>
              <option value="COMPASSIONATE">Compassionate</option>
            </select>
          </label>

          <label>
            Start Date
            <input type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} />
          </label>

          <label>
            End Date
            <input type="date" value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} />
          </label>

          <label>
            Working Days
            <input type="number" value={form.workingDaysRequested} onChange={(event) => setForm({ ...form, workingDaysRequested: event.target.value })} />
          </label>

          <label>
            Reason
            <textarea value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} />
          </label>

          <button className="primary-button" type="submit">Submit Leave Request</button>
        </form>

        <div className="panel">
          {requests.length === 0 ? (
            <p>No leave requests yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Dates</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td>{request.leaveType}</td>
                    <td>{request.approvalStatus}</td>
                    <td>{new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
