import { useEffect, useState } from 'react';
import api from '../api';

export function PositionPage() {
  const [positions, setPositions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', departmentId: '', employmentCategory: 'PERMANENT' });

  const fetchAll = async () => {
    const [positionsRes, departmentsRes] = await Promise.all([
      api.get('/positions'),
      api.get('/departments'),
    ]);

    setPositions(positionsRes.data.data || []);
    setDepartments(departmentsRes.data.data || []);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await api.post('/positions', form);
    setForm({ name: '', description: '', departmentId: '', employmentCategory: 'PERMANENT' });
    fetchAll();
  };

  return (
    <div className="page-block">
      <div className="section-header">
        <h2>Positions</h2>
      </div>

      <div className="two-column-grid">
        <form className="panel stacked-form" onSubmit={handleSubmit}>
          <label>
            Position Name
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </label>

          <label>
            Department
            <select value={form.departmentId} onChange={(event) => setForm({ ...form, departmentId: event.target.value })}>
              <option value="">Select department</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>{department.name}</option>
              ))}
            </select>
          </label>

          <label>
            Employment Category
            <select value={form.employmentCategory} onChange={(event) => setForm({ ...form, employmentCategory: event.target.value })}>
              <option value="PERMANENT">Permanent</option>
              <option value="CONTRACT">Contract</option>
              <option value="TEMPORARY">Temporary</option>
              <option value="PART_TIME">Part-time</option>
              <option value="PROBATIONARY">Probationary</option>
            </select>
          </label>

          <label>
            Description
            <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          </label>

          <button className="primary-button" type="submit">Add Position</button>
        </form>

        <div className="panel">
          {positions.length === 0 ? (
            <p>No positions found.</p>
          ) : (
            <ul className="settings-list">
              {positions.map((position) => (
                <li key={position.id}>
                  <strong>{position.name}</strong>
                  <span>{position.department?.name || 'Unassigned'}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
