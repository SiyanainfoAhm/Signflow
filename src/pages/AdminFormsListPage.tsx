import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, FileText, Edit, Eye } from 'lucide-react';
import { listForms, createForm, createFormInstance } from '../lib/formEngine';
import type { Form } from '../types/database';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Loader } from '../components/ui/Loader';

export const AdminFormsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [previewing, setPreviewing] = useState<number | null>(null);

  useEffect(() => {
    listForms().then((data) => {
      setForms(data);
      setLoading(false);
    });
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    const created = await createForm(newName.trim());
    if (created) {
      setForms((prev) => [created, ...prev]);
      setNewName('');
    }
    setCreating(false);
  };

  const handlePreview = async (formId: number) => {
    setPreviewing(formId);
    const instance = await createFormInstance(formId, 'student');
    setPreviewing(null);
    if (instance) {
      navigate(`/instances/${instance.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="bg-white border-b border-[var(--border)] shadow-sm sticky top-0 z-20">
        <div className="w-full px-4 md:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-[var(--text)]">Form Builder Admin</h1>
            <div className="flex gap-2">
              <Link to="/admin/students">
                <Button variant="outline" size="sm">
                  Students
                </Button>
              </Link>
              <Link to="/forms">
                <Button variant="outline" size="sm">
                  View Published Forms
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full px-4 md:px-6 lg:px-8 py-6">
        <Card className="mb-6">
          <h2 className="text-lg font-bold text-[var(--text)] mb-4">Create New Form</h2>
          <div className="flex gap-3">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Form name"
              className="flex-1"
            />
            <Button onClick={handleCreate} disabled={creating || !newName.trim()}>
              {creating ? (
                <Loader variant="dots" size="sm" inline className="mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2 inline" />
              )}
              {creating ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-[var(--text)] mb-4">All Forms</h2>
          {loading ? (
            <div className="py-12">
              <Loader variant="dots" size="lg" message="Loading forms..." />
            </div>
          ) : forms.length === 0 ? (
            <p className="text-gray-500">No forms yet. Create one above.</p>
          ) : (
            <ul className="space-y-2">
              {forms.map((form) => (
                <li
                  key={form.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] bg-white hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-[var(--text)]">{form.name}</div>
                      <div className="text-xs text-gray-500">
                        Status: {form.status} | Version: {form.version || '-'}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreview(form.id)}
                      disabled={previewing !== null}
                    >
                      {previewing === form.id ? (
                        <Loader variant="dots" size="sm" inline className="mr-1" />
                      ) : (
                        <Eye className="w-4 h-4 mr-1" />
                      )}
                      {previewing === form.id ? 'Loading...' : 'Preview'}
                    </Button>
                    <Link to={`/admin/forms/${form.id}/builder`}>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
};
