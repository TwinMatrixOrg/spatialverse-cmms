import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import { useAuth } from './auth/AuthContext';
import Dashboard from './pages/Dashboard';
import WorkOrders from './pages/WorkOrders';
import Permits from './pages/Permits';
import Assets from './pages/Assets';
import PMSchedules from './pages/PMSchedules';
import Contractors from './pages/Contractors';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import SpaceConsole from './pages/SpaceConsole';
import ConditionMonitoring from './pages/ConditionMonitoring';
import FloorPlan from './pages/FloorPlan';

function App() {
  const { loggedIn } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={loggedIn ? <Navigate to="/" replace /> : <Login />} />

      <Route path="/" element={loggedIn ? <Layout /> : <Navigate to="/login" replace />}>
        <Route index element={<Dashboard />} />
        <Route path="work-orders" element={<WorkOrders />} />
        <Route path="permits" element={<Permits />} />
        <Route path="assets" element={<Assets />} />
        <Route path="pm-schedules" element={<PMSchedules />} />
        <Route path="contractors" element={<Contractors />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="space-console" element={<SpaceConsole />} />
        <Route path="condition-monitoring" element={<ConditionMonitoring />} />
        <Route path="floor-plan" element={<FloorPlan />} />
        <Route path="*" element={<Navigate to={loggedIn ? '/' : '/login'} replace />} />
      </Route>

      <Route path="*" element={<Navigate to={loggedIn ? '/' : '/login'} replace />} />
    </Routes>
  );
}

export default App;
