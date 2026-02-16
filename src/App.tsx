import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminFormsListPage } from './pages/AdminFormsListPage';
import { AdminFormBuilderPage } from './pages/AdminFormBuilderPage';
import { AdminStudentsPage } from './pages/AdminStudentsPage';
import { FormsListPage } from './pages/FormsListPage';
import { FormStartPage } from './pages/FormStartPage';
import { InstanceFillPage } from './pages/InstanceFillPage';
import { FormWizardPage } from './pages/FormWizardPage';
import { ToastContainer } from './components/ui/Toast';
import { toastManager } from './utils/toast';
import type { Toast } from './components/ui/Toast';

function App() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const unsubscribe = toastManager.subscribe(setToasts);
    return unsubscribe;
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/forms" replace />} />
        <Route path="/forms" element={<FormsListPage />} />
        <Route path="/forms/:formId/start" element={<FormStartPage />} />
        <Route path="/instances/:instanceId" element={<InstanceFillPage />} />
        <Route path="/admin/forms" element={<AdminFormsListPage />} />
        <Route path="/admin/forms/:formId/builder" element={<AdminFormBuilderPage />} />
        <Route path="/admin/students" element={<AdminStudentsPage />} />
        <Route path="/legacy" element={<FormWizardPage />} />
      </Routes>
      <ToastContainer toasts={toasts} onRemove={(id) => toastManager.remove(id)} />
    </BrowserRouter>
  );
}

export default App;
