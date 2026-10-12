import { useEffect, useState } from 'react';
import api from '../api';

export function SalaryComponentPage() {
  const [components, setComponents] = useState([]);
  const [form, setForm] = useState({ name: '', type: 'ALLOWANCE', amount: '', percentage: '', description: '' });

  const fetchComponents = async () => {
    const response = await api.get('/salary-components');
    setComponents(response.data.data || []);
  };

  useEffect(() => {
    fetchComponents();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await api.post('/salary-components', form);
    setForm({ name: '', type: 'ALLOWANCE', amount: '', percentage: '', description: '' });
    fetchComponents();
  };

  return (
    <div className="page-block">
      <div className="section-header">
        <h2>Salary Components</h2>
      </div>

      <div className="two-column-grid">
        <form className="panel stacked-form" onSubmit={handleSubmit}>
          <label>
            Component Name
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </label>

          <label>
            Type
            <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
              <option value="ALLOWANCE">Allowance</option>
              <option value="DEDUCTION">Deduction</option>
              <option value="BONUS">Bonus</option>
              <option value="OTHER_EARNINGS">Other Earnings</option>
            </select>
          </label>

          <label>
            Fixed Amount
            <input value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} />
          </label>

          <label>
            Percentage
            <input value={form.percentage} onChange={(event) => setForm({ ...form, percentage: event.target.value })} />
          </label>

          <label>
            Description
            <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          </label>

          <button className="primary-button" type="submit">Save Component</button>
        </form>

        <div className="panel">
          {components.length === 0 ? (
            <p>No salary components configured.</p>
          ) : (
            <ul className="settings-list">
              {components.map((component) => (
                <li key={component.id}>
                  <strong>{component.name}</strong>
                  <span>{component.type}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
