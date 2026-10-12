import { useEffect, useState } from 'react';
import api from '../api';

export function SettingsPage() {
  const [settings, setSettings] = useState([]);
  const [form, setForm] = useState({ key: 'hospital_name', value: 'MENDI HEALTH CENTER' });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings');
        setSettings(response.data.data || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchSettings();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await api.post('/settings', form);
    setSettings((current) => [response.data.data, ...current.filter((row) => row.key !== form.key)]);
    setForm({ key: '', value: '' });
  };

  return (
    <div className="page-block">
      <div className="section-header">
        <h2>System Settings</h2>
      </div>

      <div className="two-column-grid">
        <form className="panel stacked-form" onSubmit={handleSubmit}>
          <label>
            Setting key
            <input value={form.key} onChange={(event) => setForm({ ...form, key: event.target.value })} />
          </label>

          <label>
            Value
            <input value={form.value} onChange={(event) => setForm({ ...form, value: event.target.value })} />
          </label>

          <button type="submit" className="primary-button">Save</button>
        </form>

        <div className="panel">
          <h3>Current settings</h3>
          <ul className="settings-list">
            {settings.map((setting) => (
              <li key={setting.id}>
                <strong>{setting.key}</strong>
                <span>{setting.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
