"use client";

import { useState } from "react";

export default function AddCustomerPage() {
  const [saving, setSaving] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      alert("Customer saved successfully!");
      setSaving(false);
      e.currentTarget.reset();
    }, 1000);
  }

  return (
    <div className="max-w-[700px] mx-auto space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-page-title text-page-title text-on-surface">Add Customer</h1>
        <nav className="text-label-sm text-secondary flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">home</span>
          <span>Dashboard</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span>Customers</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-primary font-bold">New Entry</span>
        </nav>
      </div>

      <div className="bg-surface-container-lowest border border-surface-variant shadow-sm rounded-sm">
        <div className="px-card_padding py-3 border-b border-surface-variant flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">person_add</span>
            <span className="font-panel-header text-panel-header text-on-surface">
              Customer Registration Form
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold text-secondary opacity-50">
            Operational Form CF-12
          </span>
        </div>
        <div className="p-[20px]">
          <form className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5" onSubmit={handleSubmit}>
            <div className="md:col-span-2">
              <label className="block font-body-semibold text-label-sm mb-1 text-on-surface-variant">
                Full Name *
              </label>
              <input
                className="w-full h-10 px-3 border border-outline-variant bg-surface text-body-reg focus:border-primary focus:ring-0 rounded-sm transition-all"
                placeholder="John Doe or Acme Corp"
                required
                type="text"
              />
            </div>
            <div>
              <label className="block font-body-semibold text-label-sm mb-1 text-on-surface-variant">
                Customer Type
              </label>
              <select className="w-full h-10 px-3 border border-outline-variant bg-surface text-body-reg focus:border-primary focus:ring-0 rounded-sm appearance-none">
                <option value="individual">Individual</option>
                <option value="organization">Organization</option>
              </select>
            </div>
            <div>
              <label className="block font-body-semibold text-label-sm mb-1 text-on-surface-variant">
                Phone Number
              </label>
              <input
                className="w-full h-10 px-3 border border-outline-variant bg-surface text-body-reg focus:border-primary focus:ring-0 rounded-sm"
                placeholder="+254 700 000 000"
                type="tel"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-body-semibold text-label-sm mb-1 text-on-surface-variant">
                Email Address
              </label>
              <input
                className="w-full h-10 px-3 border border-outline-variant bg-surface text-body-reg focus:border-primary focus:ring-0 rounded-sm"
                placeholder="customer@example.com"
                type="email"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-body-semibold text-label-sm mb-1 text-on-surface-variant">
                Shipping/Billing Address
              </label>
              <textarea
                className="w-full px-3 py-2 border border-outline-variant bg-surface text-body-reg focus:border-primary focus:ring-0 rounded-sm resize-none"
                placeholder="123 Commerce St, Suite 100..."
                rows={3}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-body-semibold text-label-sm mb-1 text-on-surface-variant">
                Internal Notes
              </label>
              <textarea
                className="w-full px-3 py-2 border border-outline-variant bg-surface text-body-reg focus:border-primary focus:ring-0 rounded-sm resize-none"
                placeholder="Preferred shipping methods, credit terms, etc."
                rows={3}
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-surface-variant">
              <button
                className="px-6 h-10 font-body-semibold text-label-sm text-secondary bg-surface-container-high hover:bg-surface-variant border border-outline-variant rounded-sm transition-colors"
                type="button"
              >
                Cancel
              </button>
              <button
                className="px-6 h-10 font-body-semibold text-label-sm text-white bg-green-600 hover:bg-green-700 rounded-sm shadow-sm transition-all active:scale-[0.98] disabled:opacity-60"
                type="submit"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Customer"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-sm flex items-start gap-4">
        <span className="material-symbols-outlined text-blue-600 mt-0.5">info</span>
        <div>
          <h4 className="font-body-semibold text-blue-800 text-[14px]">Customer Data Privacy</h4>
          <p className="text-blue-700 text-label-sm">
            All customer data is encrypted at rest. Please ensure you have explicit consent before
            storing marketing preferences according to local regulations.
          </p>
        </div>
      </div>
    </div>
  );
}