import { Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { EmployeePage } from './pages/EmployeePage';
import { DepartmentPage } from './pages/DepartmentPage';
import { PositionPage } from './pages/PositionPage';
import { SalaryComponentPage } from './pages/SalaryComponentPage';
import { PayrollPage } from './pages/PayrollPage';
import { LeavePage } from './pages/LeavePage';
import { SettingsPage } from './pages/SettingsPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="page-shell center">Loading...</div>;
  if (!user) return <Navigate to="/" replace />;

  return children;
}

function AppLayout({ children }) {
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Employees', to: '/employees' },
    { label: 'Departments', to: '/departments' },
    { label: 'Positions', to: '/positions' },
    { label: 'Salary Components', to: '/salary-components' },
    { label: 'Payroll', to: '/payroll' },
    { label: 'Leave', to: '/leave' },
    { label: 'Settings', to: '/settings' },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <h1>MENDI HEALTH CENTER</h1>
          <small>Hospital Payroll Management System</small>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <strong>Payroll Operations</strong>
            <small>Cameroon • XAF</small>
          </div>

          <div className="topbar-actions">
            <span>{user?.role || 'User'}</span>
            <button className="ghost-button" onClick={logout}>Logout</button>
          </div>
        </header>

        <div className="content-wrap">{children}</div>
      </main>
    </div>
  );
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={!user ? <LoginPage /> : <Navigate to="/dashboard" replace />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees"
        element={
          <ProtectedRoute>
            <AppLayout>
              <EmployeePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/departments"
        element={
          <ProtectedRoute>
            <AppLayout>
              <DepartmentPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/positions"
        element={
          <ProtectedRoute>
            <AppLayout>
              <PositionPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/salary-components"
        element={
          <ProtectedRoute>
            <AppLayout>
              <SalaryComponentPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/payroll"
        element={
          <ProtectedRoute>
            <AppLayout>
              <PayrollPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/leave"
        element={
          <ProtectedRoute>
            <AppLayout>
              <LeavePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <AppLayout>
              <SettingsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/'} replace />} />
    </Routes>
  );
}
