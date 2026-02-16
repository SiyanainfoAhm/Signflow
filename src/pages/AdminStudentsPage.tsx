import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, Send } from 'lucide-react';
import { listStudents, createStudent, createFormInstance, listForms } from '../lib/formEngine';
import type { Student } from '../lib/formEngine';
import type { Form } from '../types/database';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Loader } from '../components/ui/Loader';
import { toast } from '../utils/toast';

export const AdminStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [creating, setCreating] = useState(false);
  const [sendFormId, setSendFormId] = useState<string>('');
  const [sending, setSending] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([listStudents(), listForms('published')]).then(([s, f]) => {
      setStudents(s);
      setForms(f);
      setLoading(false);
      if (f.length > 0 && !sendFormId) setSendFormId(String(f[0].id));
    });
  }, []);

  const handleCreate = async () => {
    if (!newName.trim() || !newEmail.trim()) return;
    setCreating(true);
    const created = await createStudent(newName.trim(), newEmail.trim());
    if (created) {
      setStudents((prev) => [created, ...prev]);
      setNewName('');
      setNewEmail('');
      toast.success('Student added');
    } else {
      toast.error('Failed to add student');
    }
    setCreating(false);
  };

  const handleSendForm = async (studentId: number) => {
    const formId = Number(sendFormId);
    if (!formId) return;
    setSending(studentId);
    const instance = await createFormInstance(formId, 'student', studentId);
    setSending(null);
    if (instance) {
      const url = `${window.location.origin}/instances/${instance.id}`;
      await navigator.clipboard.writeText(url);
      toast.success('Form link copied to clipboard! Share with student.');
    } else {
      toast.error('Failed to create form link');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="bg-white border-b border-[var(--border)] shadow-sm sticky top-0 z-20">
        <div className="w-full px-4 md:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-[var(--text)]">Students</h1>
            <div className="flex gap-2">
              <Link to="/admin/forms">
                <Button variant="outline" size="sm">
                  Forms
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
          <h2 className="text-lg font-bold text-[var(--text)] mb-4">Add Student</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Student name"
              className="flex-1"
            />
            <Input
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Email"
              type="email"
              className="flex-1"
            />
            <Button onClick={handleCreate} disabled={creating || !newName.trim() || !newEmail.trim()}>
              <Plus className="w-4 h-4 mr-2 inline" />
              Add
            </Button>
          </div>
        </Card>

        <Card className="mb-4">
          <h2 className="text-lg font-bold text-[var(--text)] mb-3">Send Form to Students</h2>
          <p className="text-sm text-gray-600 mb-3">
            Select a form, then click "Send" next to a student to create a unique link and copy it to clipboard.
          </p>
          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Form:</label>
            <Select
              value={sendFormId}
              onChange={setSendFormId}
              options={forms.map((f) => ({ value: String(f.id), label: f.name }))}
              className="max-w-xs"
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-[var(--text)] mb-4">Student List</h2>
          {loading ? (
            <div className="py-12">
              <Loader variant="dots" size="lg" message="Loading students..." />
            </div>
          ) : students.length === 0 ? (
            <p className="text-gray-500">No students yet. Add one above.</p>
          ) : (
            <ul className="space-y-2">
              {students.map((student) => (
                <li
                  key={student.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] bg-white hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-[var(--text)]">{student.name}</div>
                      <div className="text-xs text-gray-500">{student.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendForm(student.id)}
                      disabled={sending !== null || forms.length === 0}
                    >
                      <Send className="w-4 h-4 mr-1" />
                      {sending === student.id ? 'Creating...' : 'Send form'}
                    </Button>
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
