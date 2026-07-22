'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { customerApi } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

export default function AddCustomerPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstname: '', lastname: '', email: '', phone: '', address: '',
  });

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await customerApi.create(form);
      success('Customer added', `${form.firstname} ${form.lastname} has been registered.`);
      router.push('/customers');
    } catch (err: unknown) {
      error('Failed to add customer', err instanceof Error ? err.message : undefined);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-container_padding">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-surface-container rounded-lg transition-colors">
          <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
        </button>
        <div>
          <h1 className="font-page-title text-page-title text-on-background">Add Customer</h1>
          <nav className="flex text-label-sm text-on-surface-variant gap-1 mt-0.5">
            <span className="hover:text-primary cursor-pointer" onClick={() => router.push('/customers')}>Customers</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface font-semibold">Add Customer</span>
          </nav>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-white border border-outline-variant/30 rounded-lg shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-outline-variant/20 bg-surface-container-low flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">person_add</span>
            <span className="font-panel-header text-panel-header">Customer Details</span>
          </div>

          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">First Name *</label>
                <input required value={form.firstname} onChange={(e) => set('firstname', e.target.value)}
                  placeholder="John"
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-reg focus:ring-2 focus:ring-primary outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">Last Name *</label>
                <input required value={form.lastname} onChange={(e) => set('lastname', e.target.value)}
                  placeholder="Kamau"
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-reg focus:ring-2 focus:ring-primary outline-none transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">Email *</label>
              <input required type="email" value={form.email} onChange={(e) => set('email', e.target.value)}
                placeholder="john.kamau@gmail.com"
                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-reg focus:ring-2 focus:ring-primary outline-none transition-all" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">Phone</label>
              <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)}
                placeholder="0712 345 678"
                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-reg focus:ring-2 focus:ring-primary outline-none transition-all" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">Address</label>
              <input value={form.address} onChange={(e) => set('address', e.target.value)}
                placeholder="Nairobi, Kenya"
                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-reg focus:ring-2 focus:ring-primary outline-none transition-all" />
            </div>
          </div>

          <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant/20 flex justify-end gap-3">
            <button type="button" onClick={() => router.back()}
              className="px-5 py-2 border border-outline-variant text-on-surface-variant rounded-lg font-body-semibold hover:bg-surface-container transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="px-6 py-2 bg-primary text-on-primary rounded-lg font-body-semibold hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-60">
              {loading && <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>}
              {loading ? 'Saving…' : 'Save Customer'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}