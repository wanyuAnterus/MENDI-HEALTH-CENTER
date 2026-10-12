import { useEffect, useState } from 'react';
import api from '../api';

const emptySummary = {
  totalActiveEmployees: 0,
  totalEmployees: 0,
  pendingLeaveRequests: 0,
  totalBasicSalaries: 0,
  currentPayrollPeriod: 'Not created',
  settingsCount: 0,
};

export function DashboardPage() {
  const [health, setHealth] = useState(null);
  const [summary, setSummary] = useState(emptySummary);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [healthRes, summaryRes] = await Promise.all([
          api.get('/health'),
          api.get('/reports/summary'),
        ]);

        setHealth(healthRes.data);
        setSummary(summaryRes.data.data || emptySummary);
      } catch (error) {
        setHealth({ ok: false, message: 'API unavailable' });
        setSummary(emptySummary);
      }
    };

    fetchDashboard();
  }, []);

  const cards = [
    { title: 'Active Employees', value: String(summary.totalActiveEmployees), accent: 'blue' },
    { title: 'Pending Leave Requests', value: String(summary.pendingLeaveRequests), accent: 'orange' },
    { title: 'Monthly Gross Payroll', value: `${Number(summary.totalBasicSalaries || 0).toLocaleString()} FCFA`, accent: 'green' },
    { title: 'Current Payroll Period', value: summary.currentPayrollPeriod, accent: 'red' },
  ];

  return (
    <div className="page-block">
      <div className="section-header">
        <h2>Dashboard</h2>
      </div>

      <div className="stats-grid">
        {cards.map((card) => (
          <div key={card.title} className={`stat-card ${card.accent}`}>
            <span>{card.title}</span>
            <strong>{card.value}</strong>
          </div>
        ))}
      </div>

      <div className="panel">
        <h3>System status</h3>
        <p>{health ? health.message : 'Checking backend connection...'}</p>
      </div>
    </div>
  );
}
