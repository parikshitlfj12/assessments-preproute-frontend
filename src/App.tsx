import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { AuthWatcher } from '@/routes/AuthWatcher';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { CreateEditTestPage } from '@/pages/CreateEditTestPage';
import { AddQuestionsPage } from '@/pages/AddQuestionsPage';
import { PreviewPublishPage } from '@/pages/PreviewPublishPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthWatcher />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/tests/new" element={<CreateEditTestPage />} />
          <Route path="/tests/:id/edit" element={<CreateEditTestPage />} />
          <Route path="/tests/:id/questions" element={<AddQuestionsPage />} />
          <Route path="/tests/:id/preview" element={<PreviewPublishPage />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
