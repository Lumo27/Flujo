import { Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { TransactionsPage } from '@/pages/TransactionsPage';
import { CalendarPage } from '@/pages/CalendarPage';
import { HowToFlowPage } from '@/pages/HowToFlowPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="/movimientos" element={<TransactionsPage />} />
        <Route path="/calendario" element={<CalendarPage />} />
        <Route path="/como-fluir" element={<HowToFlowPage />} />
      </Route>
    </Routes>
  );
}
