'use client';

import { useEffect, useState } from 'react';
import { supplierApi, type SupplierResponse, type SupplierRequest } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import TableSkeleton from '@/components/ui/TableSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmModal from '@/components/ui/ConfirmModal';

const EMPTY_FORM: SupplierRequest = { name: '', contactPerson: '', email: '', phone: '' };

export default function SuppliersPage() {
  const { success, error } = useToast();
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SupplierResponse | null>(null);
  const [form, setForm] = useState<SupplierRequest>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SupplierResponse | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    supplierApi.getAll()
      .then(setSuppliers)
      .catch((err: unknown) => error('Failed to load suppliers', err instanceof Error ? err.message : undefined))
      .finally(() => setLoading(false));
  }, []);

  function openAdd() { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); }
  function openEdit(s: SupplierResponse) {
    setEditing(s);
    setForm({ name: s.name, contactPerson: s.contactPerson, email: s.email, phone: s.phone });
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const updated = await supplierApi.update(editing.id, form);
        setSuppliers((prev) => prev.map((s) => (s.id === editing.id ? updated : s)));
        success('Supplier updated', `${form.name} has been updated.`);
      } else {
        const created = await supplierApi.create(form);
        setSuppliers((prev) => [...prev, created]);
        success('Supplier added', `${form.name} has been added.`);
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
      await supplierApi.delete(deleteTarget.id);
      setSuppliers((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      success('Supplier removed', `${deleteTarget.name} has been deleted.`);
      setDeleteTarget(null);
    } catch (err: unknown) {
      error('Delete failed', err instanceof Error ? err.message : undefined);
    } finally {
      setDeleting(false);
    }
  }

  function set(key: keyof SupplierRequest, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="p-container_padding">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-page-title text-page-title text-on-background">Suppliers</h1>
          <p className="text-label-sm text-on-surface-variant mt-0.5">{suppliers.length} suppliers</p>
        </div>
        <button onClick={openAdd}
          className="bg-primary text-on-primary px-4 py-2 rounded-lg font-body-semibold flex items-center gap-2 hover:brightness-110 transition-all shadow-sm self-start">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Supplier
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-outline-variant/30 rounded-lg shadow-sm p-5 mb-6">
          <h2 className="font-panel-header text-panel-header mb-4">{editing ? 'Edit Supplier' : 'New Supplier'}</h2>
          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {([
                { key: 'name', label: 'Company Name', placeholder: 'TechSupply Kenya', required: true },
                { key: 'contactPerson', label: 'Contact Person', placeholder: 'Alice Mwangi', required: true },
                { key: 'email', label: 'Email', placeholder: 'alice@company.co.ke', required: true, type: 'email' },
                { key: 'phone', label: 'Phone', placeholder: '0722 000 111', required: false},
              ] as const).map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">
                    {field.label}{field.required ? ' *' : ''}
                  </label>
                  <input
                    required={field.required}
                    // type={field.type || 'text'}
                    value={form[field.key]}
                    onChange={(e) => set(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-reg focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-5 py-2 border border-outline-variant text-on-surface-variant rounded-lg font-body-semibold hover:bg-surface-container transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="px-6 py-2 bg-primary text-on-primary rounded-lg font-body-semibold hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-60">
                {saving && <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>}
                {editing ? 'Update' : 'Add Supplier'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-outline-variant/30 rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-outline-variant/20 bg-surface-container-low flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[18px]">local_shipping</span>
          <span className="font-panel-header text-panel-header">Supplier Directory</span>
        </div>

        {loading ? (
          <TableSkeleton rows={5} columns={5} />
        ) : suppliers.length === 0 ? (
          <EmptyState icon="local_shipping" title="No suppliers yet" description="Add your first supplier to start managing purchase orders." actionLabel="Add Supplier" onAction={openAdd} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container border-b border-outline-variant/20">
                <tr>
                  <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant">Company</th>
                  <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant">Contact Person</th>
                  <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant">Email</th>
                  <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant">Phone</th>
                  <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {suppliers.map((s, idx) => (
                  <tr key={s.id}
                    className={`hover:bg-surface-container-low transition-colors ${idx % 2 === 1 ? 'bg-surface-container-lowest' : 'bg-white'}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-on-secondary-container text-base">business</span>
                        </div>
                        <span className="font-body-semibold text-on-surface">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-body-reg text-on-surface-variant">{s.contactPerson}</td>
                    <td className="px-4 py-3 text-body-reg text-primary">{s.email}</td>
                    <td className="px-4 py-3 text-body-reg text-on-surface-variant">{s.phone}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(s)} className="p-1.5 hover:bg-surface-container rounded transition-colors">
                          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">edit</span>
                        </button>
                        <button onClick={() => setDeleteTarget(s)} className="p-1.5 hover:bg-error-container rounded transition-colors">
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
        title="Remove Supplier"
        message={`"${deleteTarget?.name}" will be permanently removed. Existing purchase orders linked to this supplier will remain.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}