import { useEffect, useState } from 'react';
import api from '../api';

const emptyForm = {
  employeeNumber: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  basicSalary: '',
  departmentId: '',
  positionId: '',
  employmentType: 'PERMANENT',
  salaryPaymentMethod: 'BANK_TRANSFER',
};

export function EmployeePage() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);

  const fetchEmployees = async () => {
    const response = await api.get('/employees');
    setEmployees(response.data.data || []);
  };

  const fetchMetadata = async () => {
    const [employeesRes, departmentsRes, positionsRes] = await Promise.all([
      api.get('/employees'),
      api.get('/departments'),
      api.get('/positions'),
    ]);

    setEmployees(employeesRes.data.data || []);
    setDepartments(departmentsRes.data.data || []);
    setPositions(positionsRes.data.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await api.post('/employees', form);
    setForm(emptyForm);
    fetchEmployees();
  };

  return (
    <div className="page-block">
      <div className="section-header">
        <h2>Employees</h2>
      </div>

      <div className="two-column-grid">
        <form className="panel stacked-form" onSubmit={handleSubmit}>
          <label>
            Employee Number
            <input value={form.employeeNumber} onChange={(event) => setForm({ ...form, employeeNumber: event.target.value })} />
          </label>

          <div className="two-inline-grid">
            <label>
              First Name
              <input value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} />
            </label>
            <label>
              Last Name
              <input value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} />
            </label>
          </div>

          <div className="two-inline-grid">
            <label>
              Email
              <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            </label>
            <label>
              Phone
              <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
            </label>
          </div>

          <div className="two-inline-grid">
            <label>
              Department
              <select value={form.departmentId} onChange={(event) => setForm({ ...form, departmentId: event.target.value })}>
                <option value="">Select</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>{department.name}</option>
                ))}
              </select>
            </label>
            <label>
              Position
              <select value={form.positionId} onChange={(event) => setForm({ ...form, positionId: event.target.value })}>
                <option value="">Select</option>
                {positions.map((position) => (
                  <option key={position.id} value={position.id}>{position.name}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="two-inline-grid">
            <label>
              Employment Type
              <select value={form.employmentType} onChange={(event) => setForm({ ...form, employmentType: event.target.value })}>
                <option value="PERMANENT">Permanent</option>
                <option value="CONTRACT">Contract</option>
                <option value="TEMPORARY">Temporary</option>
                <option value="PART_TIME">Part-time</option>
              </select>
            </label>
            <label>
              Payment Method
              <select value={form.salaryPaymentMethod} onChange={(event) => setForm({ ...form, salaryPaymentMethod: event.target.value })}>
                <option value="BANK_TRANSFER">Bank transfer</option>
                <option value="CASH">Cash</option>
                <option value="MOBILE_MONEY">Mobile money</option>
              </select>
            </label>
          </div>

          <label>
            Basic Salary
            <input type="number" value={form.basicSalary} onChange={(event) => setForm({ ...form, basicSalary: event.target.value })} />
          </label>

          <button type="submit" className="primary-button">Add Employee</button>
        </form>

        <div className="panel">
          {loading ? (
            <p>Loading employees...</p>
          ) : employees.length === 0 ? (
            <p>No employees found.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Number</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Salary</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id}>
                    <td>{employee.employeeNumber}</td>
                    <td>{`${employee.firstName} ${employee.lastName}`}</td>
                    <td>{employee.department?.name || 'Unassigned'}</td>
                    <td>{Number(employee.basicSalary || 0).toLocaleString()} FCFA</td>
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
