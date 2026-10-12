import { useEffect, useState } from 'react';
import api from '../api';

export function DepartmentPage() {
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ name: '', description: '' });

  const fetchDepartments = async () => {
    const response = await api.get('/departments');
    setDepartments(response.data.data || []);
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await api.post('/departments', form);
    setForm({ name: '', description: '' });
    fetchDepartments();
  };

  return (
    <div className="page-block">
      <div className="section-header">
        <h2>Departments</h2>
      </div>

      <div className="two-column-grid">
        <form className="panel stacked-form" onSubmit={handleSubmit}>
          <label>
            Department Name
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </label>

          <label>
            Description
            <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          </label>

          <button className="primary-button" type="submit">Add Department</button>
        </form>

        <div className="panel">
          {departments.length === 0 ? (
            <p>No departments found.</p>
          ) : (
            <ul className="settings-list">
              {departments.map((department) => (
                <li key={department.id}>
                  <strong>{department.name}</strong>
                  <span>{department.description || 'No description'}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
