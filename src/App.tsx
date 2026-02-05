import { useState, useEffect } from 'react';
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
    <>
      <FormWizardPage />
      <ToastContainer toasts={toasts} onRemove={(id) => toastManager.remove(id)} />
    </>
  );
}

export default App;

