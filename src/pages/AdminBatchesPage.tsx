import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Users } from 'lucide-react';
import { listBatches, createBatch, updateBatch, updateBatchStudentAssignments, listUsersForBatchAssignment, listStudents } from '../lib/formEngine';
import type { Batch, UserRow, Student } from '../lib/formEngine';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { MultiSelect } from '../components/ui/MultiSelect';
import { Modal } from '../components/ui/Modal';
import { Loader } from '../components/ui/Loader';
import { toast } from '../utils/toast';

export const AdminBatchesPage: React.FC = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [trainers, setTrainers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [draft, setDraft] = useState({ name: '', trainer_id: '' });
  const [editDraft, setEditDraft] = useState<{ name: string; trainer_id: string; student_ids: number[] } | null>(null);
  const [students, setStudents] = useState<Student[]>([]);

  const loadBatches = async () => {
    const data = await listBatches();
    setBatches(data);
  };

  const loadTrainers = async () => {
    const data = await listUsersForBatchAssignment();
    setTrainers(data);
  };

  const loadStudents = async () => {
    const data = await listStudents();
    setStudents(data);
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadBatches(), loadTrainers(), loadStudents()]).finally(() => setLoading(false));
  }, []);

  const trainerOptions = trainers.map((t) => ({ value: String(t.id), label: `${t.full_name} (${t.email})` }));

  const handleCreate = async () => {
    if (!draft.name.trim()) {
      toast.error('Batch name is required');
      return;
    }
    const trainerId = Number(draft.trainer_id);
    if (!trainerId || !Number.isFinite(trainerId)) {
      toast.error('Select a trainer');
      return;
    }
    setCreating(true);
    const created = await createBatch({ name: draft.name.trim(), trainer_id: trainerId });
    setCreating(false);
    if (created) {
      await loadBatches();
      setDraft({ name: '', trainer_id: '' });
      setIsCreateOpen(false);
      toast.success('Batch added');
    } else {
      toast.error('Failed to add batch');
    }
  };

  const editingBatch = batches.find((b) => b.id === editingId);
  useEffect(() => {
    if (!editingBatch) {
      setEditDraft(null);
      return;
    }
    const studentIds = students.filter((s) => s.batch_id === editingBatch.id).map((s) => s.id);
    setEditDraft({
      name: editingBatch.name,
      trainer_id: String(editingBatch.trainer_id),
      student_ids: studentIds,
    });
  }, [editingBatch, students]);

  const handleSaveEdit = async () => {
    if (!editingId || !editDraft) return;
    if (!editDraft.name.trim()) {
      toast.error('Batch name is required');
      return;
    }
    const trainerId = Number(editDraft.trainer_id);
    if (!trainerId || !Number.isFinite(trainerId)) {
      toast.error('Select a trainer');
      return;
    }
    setSavingEdit(true);
    const batchUpdated = await updateBatch(editingId, {
      name: editDraft.name.trim(),
      trainer_id: trainerId,
    });
    const assignmentsOk = await updateBatchStudentAssignments(editingId, editDraft.student_ids);
    setSavingEdit(false);
    if (batchUpdated && assignmentsOk) {
      await loadBatches();
      await loadStudents();
      setEditingId(null);
      toast.success('Batch updated');
    } else {
      toast.error('Failed to update batch');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="w-full px-4 md:px-6 lg:px-8 py-6">
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[var(--text)]">Batches</h2>
              <p className="text-sm text-gray-600 mt-1">
                Create batches and assign them to trainers. Students must belong to a batch.
              </p>
            </div>
            <Button onClick={() => setIsCreateOpen(true)} className="min-w-[140px]">
              <Plus className="w-4 h-4 mr-2 inline" />
              Add Batch
            </Button>
          </div>
          {trainers.length === 0 && !loading && (
            <p className="text-amber-600 text-sm mt-2">Add at least one trainer (Trainers page) before creating batches.</p>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-[var(--text)] mb-4">Batch Directory</h2>
          {loading ? (
            <div className="py-12">
              <Loader variant="dots" size="lg" message="Loading batches..." />
            </div>
          ) : batches.length === 0 ? (
            <p className="text-gray-500">No batches yet. Create a batch to assign students.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[600px] w-full text-sm border border-[var(--border)] rounded-lg overflow-hidden">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold border-b border-[var(--border)]">Batch</th>
                    <th className="text-left px-4 py-3 font-semibold border-b border-[var(--border)]">Trainer</th>
                    <th className="text-right px-4 py-3 font-semibold border-b border-[var(--border)]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map((batch) => (
                    <tr key={batch.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 border-b border-[var(--border)]">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{batch.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-b border-[var(--border)] text-gray-700">
                        {batch.trainer_name ?? `ID: ${batch.trainer_id}`}
                      </td>
                      <td className="px-4 py-3 border-b border-[var(--border)] text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingId(batch.id)}
                          className="inline-flex items-center justify-center gap-1.5"
                        >
                          <Pencil className="w-4 h-4" />
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Modal
        isOpen={isCreateOpen}
        onClose={() => !creating && setIsCreateOpen(false)}
        title="Add Batch"
        size="md"
      >
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Batch Name *</span>
            <Input
              value={draft.name}
              onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Batch A, Morning Class"
              className="mt-1"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Trainer *</span>
            <Select
              value={draft.trainer_id}
              onChange={(v) => setDraft((p) => ({ ...p, trainer_id: v }))}
              options={[{ value: '', label: 'Select trainer' }, ...trainerOptions]}
              className="mt-1"
              portal
            />
          </label>
        </div>
        <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-[var(--border)]">
          <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={creating}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleCreate}
            disabled={creating || !draft.name.trim() || !draft.trainer_id || trainers.length === 0}
          >
            {creating ? 'Adding...' : 'Add Batch'}
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={!!editingId}
        onClose={() => !savingEdit && setEditingId(null)}
        title="Edit Batch"
        size="lg"
      >
        {editDraft && (
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Batch Name *</span>
              <Input
                value={editDraft.name}
                onChange={(e) => setEditDraft((p) => (p ? { ...p, name: e.target.value } : null))}
                placeholder="e.g. Batch A"
                className="mt-1"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Trainer *</span>
              <Select
                value={editDraft.trainer_id}
                onChange={(v) => setEditDraft((p) => (p ? { ...p, trainer_id: v } : null))}
                options={[{ value: '', label: 'Select trainer' }, ...trainerOptions]}
                className="mt-1"
                portal
              />
            </label>
            <div className="mt-4">
              <MultiSelect
                label="Students"
                value={editDraft.student_ids}
                onChange={(ids) => setEditDraft((p) => (p ? { ...p, student_ids: ids } : null))}
                options={students.map((s) => ({
                  value: s.id,
                  label: `${[s.first_name, s.last_name].filter(Boolean).join(' ') || s.email} (${s.student_id ?? s.email})`,
                }))}
                placeholder="Select students for this batch"
                maxHeight={220}
              />
            </div>
          </div>
        )}
        {editDraft && (
          <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-[var(--border)]">
            <Button variant="outline" onClick={() => setEditingId(null)} disabled={savingEdit}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveEdit}
              disabled={savingEdit || !editDraft.name.trim() || !editDraft.trainer_id}
            >
              {savingEdit ? 'Saving...' : 'Save'}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};
