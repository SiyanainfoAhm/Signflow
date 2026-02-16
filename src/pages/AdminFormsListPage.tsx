import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, FileText, Edit, Eye } from 'lucide-react';
import { listForms, createForm, createFormInstance } from '../lib/formEngine';
import type { Form } from '../types/database';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Loader } from '../components/ui/Loader';

export const AdminFormsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [qualificationCode, setQualificationCode] = useState('');
  const [qualificationName, setQualificationName] = useState('');
  const [unitCode, setUnitCode] = useState('');
  const [unitName, setUnitName] = useState('');
  const [task1Label, setTask1Label] = useState('');
  const [task1Method, setTask1Method] = useState('');
  const [task2Label, setTask2Label] = useState('');
  const [task2Method, setTask2Method] = useState('');
  const [creating, setCreating] = useState(false);
  const [previewing, setPreviewing] = useState<number | null>(null);

  useEffect(() => {
    listForms().then((data) => {
      setForms(data);
      setLoading(false);
    });
  }, []);

  const canCreate =
    newName.trim() &&
    qualificationCode.trim() &&
    qualificationName.trim() &&
    unitCode.trim() &&
    unitName.trim() &&
    task1Label.trim() &&
    task1Method.trim() &&
    task2Label.trim() &&
    task2Method.trim();

  const handleCreate = async () => {
    if (!canCreate) return;
    setCreating(true);
    const created = await createForm({
      name: newName.trim(),
      qualification_code: qualificationCode.trim(),
      qualification_name: qualificationName.trim(),
      unit_code: unitCode.trim(),
      unit_name: unitName.trim(),
      assessment_task_1_label: task1Label.trim(),
      assessment_task_1_method: task1Method.trim(),
      assessment_task_2_label: task2Label.trim(),
      assessment_task_2_method: task2Method.trim(),
    });
    if (created) {
      setForms((prev) => [created, ...prev]);
      setNewName('');
      setQualificationCode('');
      setQualificationName('');
      setUnitCode('');
      setUnitName('');
      setTask1Label('');
      setTask1Method('');
      setTask2Label('');
      setTask2Method('');
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
          <p className="text-sm text-gray-600 mb-4">
            All fields are required. Qualification, unit, and assessment task details must be filled before creating the form.
          </p>
          <div className="space-y-3">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Form name"
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                value={qualificationCode}
                onChange={(e) => setQualificationCode(e.target.value)}
                placeholder="Qualification Code *"
                required
              />
              <Input
                value={qualificationName}
                onChange={(e) => setQualificationName(e.target.value)}
                placeholder="Qualification Name *"
                required
              />
              <Input
                value={unitCode}
                onChange={(e) => setUnitCode(e.target.value)}
                placeholder="Unit Code *"
                required
              />
              <Input
                value={unitName}
                onChange={(e) => setUnitName(e.target.value)}
                placeholder="Unit Name *"
                required
              />
            </div>
            <div className="border-t border-gray-200 pt-4 mt-2">
              <div className="text-sm font-semibold text-gray-700 mb-2">Assessment Tasks (required)</div>
              <div className="space-y-3">
                <div>
                  <Input
                    value={task1Label}
                    onChange={(e) => setTask1Label(e.target.value)}
                    placeholder="Assessment task 1 - Evidence number (e.g. Assessment task 1) *"
                    required
                  />
                  <Textarea
                    value={task1Method}
                    onChange={(e) => setTask1Method(e.target.value)}
                    placeholder="Assessment task 1 - Method/Type of evidence (e.g. Written Assessment (WA)) *"
                    rows={2}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Input
                    value={task2Label}
                    onChange={(e) => setTask2Label(e.target.value)}
                    placeholder="Assessment task 2 - Evidence number (e.g. Assessment task 2) *"
                    required
                  />
                  <Textarea
                    value={task2Method}
                    onChange={(e) => setTask2Method(e.target.value)}
                    placeholder="Assessment task 2 - Method/Type of evidence (use new lines for multiple items) *"
                    rows={3}
                    className="mt-1"
                    required
                  />
                </div>
              </div>
            </div>
            <Button onClick={handleCreate} disabled={creating || !canCreate}>
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
