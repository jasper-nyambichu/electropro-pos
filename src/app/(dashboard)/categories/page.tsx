'use client';

import { useEffect, useState } from 'react';
import { categoryApi, type CategoryResponse, type CategoryRequest } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import TableSkeleton from '@/components/ui/TableSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function CategoriesPage() {
  const { success, error } = useToast();
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<CategoryResponse | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CategoryResponse | null>(null);
  const [form, setForm] = useState<CategoryRequest>({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    try {
      const data = await categoryApi.getAll();
      setCategories(data);
    } catch (err: unknown) {
      error('Failed to load categories', err instanceof Error ? err.message : undefined);
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setEditing(null);
    setForm({ name: '', description: '' });
    setShowForm(true);
  }

  function openEdit(c: CategoryResponse) {
    setEditing(c);
    setForm({ name: c.name, description: c.description });
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const updated = await categoryApi.update(editing.id, form);
        setCategories((prev) => prev.map((c) => (c.id === editing.id ? updated : c)));
        success('Category updated', `${form.name} has been updated.`);
      } else {
        const created = await categoryApi.create(form);
        setCategories((prev) => [...prev, created]);
        success('Category created', `${form.name} has been added.`);
      }
      setShowForm(false);
    } catch (err: unknown) {
      error('Save failed', err instanceof Error ? err.message : undefined);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await categoryApi.delete(deleteTarget.id);
      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      success('Category deleted', `${deleteTarget.name} has been removed.`);
      setDeleteTarget(null);
    } catch (err: unknown) {
      error('Delete failed', err instanceof Error ? err.message : undefined);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="p-container_padding">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-page-title text-page-title text-on-background">Categories</h1>
          <p className="text-label-sm text-on-surface-variant mt-0.5">{categories.length} categories</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-primary text-on-primary px-4 py-2 rounded-lg font-body-semibold flex items-center gap-2 hover:brightness-110 transition-all shadow-sm self-start"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Category
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white border border-outline-variant/30 rounded-lg shadow-sm p-5 mb-6">
          <h2 className="font-panel-header text-panel-header mb-4">
            {editing ? `Edit: ${editing.name}` : 'New Category'}
          </h2>
          <form onSubmit={handleSave} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">Name *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Electronics"
                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-reg focus:ring-2 focus:ring-primary outline-none transition-all" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">Description</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Optional description"
                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-reg focus:ring-2 focus:ring-primary outline-none transition-all" />
            </div>
            <div className="flex gap-2 items-end">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-outline-variant text-on-surface-variant rounded-lg font-body-semibold hover:bg-surface-container transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="px-5 py-2 bg-primary text-on-primary rounded-lg font-body-semibold hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-60">
                {saving && <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>}
                {editing ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-outline-variant/30 rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-outline-variant/20 bg-surface-container-low flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[18px]">category</span>
          <span className="font-panel-header text-panel-header">Product Categories</span>
        </div>

        {loading ? (
          <TableSkeleton rows={5} columns={4} />
        ) : categories.length === 0 ? (
          <EmptyState
            icon="category"
            title="No categories yet"
            description="Create your first category to organise your products."
            actionLabel="Add Category"
            onAction={openAdd}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container border-b border-outline-variant/20">
                <tr>
                  <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant">Name</th>
                  <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant">Description</th>
                  <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {categories.map((c, idx) => (
                  <tr key={c.id}
                    className={`hover:bg-surface-container-low transition-colors ${idx % 2 === 1 ? 'bg-surface-container-lowest' : 'bg-white'}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-secondary-container rounded-full flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-on-secondary-container text-base">category</span>
                        </div>
                        <span className="font-body-semibold text-on-surface">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-body-reg text-on-surface-variant">{c.description || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-surface-container rounded transition-colors" title="Edit">
                          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">edit</span>
                        </button>
                        <button onClick={() => setDeleteTarget(c)} className="p-1.5 hover:bg-error-container rounded transition-colors" title="Delete">
                          <span className="material-symbols-outlined text-[18px] text-error">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Category"
        message={`"${deleteTarget?.name}" will be permanently deleted. Products in this category will lose their category assignment.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}