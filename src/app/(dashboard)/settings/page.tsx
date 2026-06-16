"use client";

import { useState } from "react";

const TABS = [
  { label: "Business Info", icon: "business" },
  { label: "Receipt", icon: "description" },
  { label: "Tax Settings", icon: "account_balance" },
  { label: "Payment Methods", icon: "payments" },
  { label: "Alerts & SMS", icon: "notifications_active" },
  { label: "Security", icon: "lock" },
];

function ToggleRow({ title, description, defaultChecked = true }: { title: string; description: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between p-4 bg-surface-container-low rounded border border-outline-variant/10">
      <div className="flex flex-col">
        <span className="font-body-semibold text-on-surface">{title}</span>
        <span className="text-label-sm text-secondary">{description}</span>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" defaultChecked={defaultChecked} className="sr-only peer" />
        <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
      </label>
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [showToast, setShowToast] = useState(false);

  function handleSave() {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row gap-gutter">
        <div className="w-full md:w-[240px] shrink-0">
          <div className="bg-surface-container-lowest border border-outline-variant/20 rounded shadow-sm overflow-hidden">
            <div className="p-4 border-b border-outline-variant/10 bg-surface-container">
              <h2 className="font-panel-header text-panel-header text-on-surface">Configuration</h2>
            </div>
            <ul className="flex flex-col">
              {TABS.map((tab, i) => (
                <li key={tab.label}>
                  <button
                    onClick={() => setActiveTab(i)}
                    className={`w-full text-left px-4 py-3 transition-colors flex items-center ${
                      activeTab === i
                        ? "font-body-semibold text-primary bg-primary-fixed border-l-4 border-primary"
                        : "font-body-reg text-secondary hover:bg-surface-container-high"
                    }`}
                  >
                    <span className="material-symbols-outlined mr-3 text-[20px]">{tab.icon}</span>
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex-1 space-y-gutter">
          {activeTab === 0 && (
            <div className="bg-surface-container-lowest border border-outline-variant/20 rounded shadow-sm">
              <div className="p-card_padding border-b border-outline-variant/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">storefront</span>
                  <h2 className="font-panel-header text-panel-header">Business Information</h2>
                </div>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Business Name</label>
                  <input className="w-full h-10 border-surface-variant focus:border-primary focus:ring-0 rounded text-body-reg px-3 bg-surface-container-lowest" type="text" defaultValue="ElectroPro POS" />
                </div>
                <div className="space-y-1">
                  <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">KRA PIN (Tax ID)</label>
                  <input className="w-full h-10 border-surface-variant focus:border-primary focus:ring-0 rounded text-body-reg px-3 bg-surface-container-lowest" type="text" defaultValue="P051234567Z" />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Nairobi Address</label>
                  <textarea className="w-full border-surface-variant focus:border-primary focus:ring-0 rounded text-body-reg px-3 py-2 bg-surface-container-lowest" rows={2} defaultValue="Westlands Business Park, 4th Floor, Suite 402, Nairobi, Kenya" />
                </div>
                <div className="space-y-1">
                  <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Currency</label>
                  <select className="w-full h-10 border-surface-variant focus:border-primary focus:ring-0 rounded text-body-reg px-3 bg-surface-container-lowest" defaultValue="KES">
                    <option value="KES">KES - Kenyan Shilling</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Timezone</label>
                  <select className="w-full h-10 border-surface-variant focus:border-primary focus:ring-0 rounded text-body-reg px-3 bg-surface-container-lowest" defaultValue="nairobi">
                    <option value="nairobi">(GMT+03:00) Nairobi, Kenya</option>
                    <option value="london">(GMT+00:00) London, UK</option>
                    <option value="newyork">(GMT-05:00) New York, USA</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 1 && (
            <div className="bg-surface-container-lowest border border-outline-variant/20 rounded shadow-sm">
              <div className="p-card_padding border-b border-outline-variant/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">print</span>
                  <h2 className="font-panel-header text-panel-header">Receipt Settings</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Receipt Header Text</label>
                    <textarea
                      className="w-full border-surface-variant focus:border-primary focus:ring-0 rounded text-body-reg px-3 py-2 bg-surface-container-lowest"
                      rows={3}
                      defaultValue={"Welcome to ElectroPro - Your Tech Partner!\nThank you for shopping with us."}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Receipt Footer Text</label>
                    <textarea
                      className="w-full border-surface-variant focus:border-primary focus:ring-0 rounded text-body-reg px-3 py-2 bg-surface-container-lowest"
                      rows={3}
                      defaultValue={"Items once sold are not returnable.\nPlease keep your receipt safe."}
                    />
                  </div>
                  <ToggleRow title="Auto-generate Serial Numbers" description="Automatically assign unique IDs to every sale" />
                  <ToggleRow title="Thermal Printer Mode (80mm)" description="Optimize layout for standard 80mm thermal rolls" />
                </div>
              </div>
            </div>
          )}

          {activeTab > 1 && (
            <div className="bg-surface-container-lowest border border-outline-variant/20 rounded shadow-sm p-6">
              <p className="text-secondary text-body-reg">
                {TABS[activeTab].label} settings coming soon.
              </p>
            </div>
          )}

          <div className="flex justify-end items-center gap-4 py-4">
            <button className="px-6 py-2 border border-outline text-secondary font-body-semibold rounded hover:bg-surface-variant transition-colors">
              Discard Changes
            </button>
            <button
              onClick={handleSave}
              className="px-8 py-2 bg-primary text-on-primary font-body-semibold rounded shadow-md hover:opacity-90 transition-opacity flex items-center"
            >
              <span className="material-symbols-outlined mr-2">save</span>
              Save Configuration
            </button>
          </div>
        </div>
      </div>

      <div
        className={`fixed bottom-6 right-6 bg-inverse-surface text-on-primary-container px-6 py-3 rounded-lg shadow-xl transition-all duration-300 flex items-center gap-3 z-50 ${
          showToast ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
        }`}
      >
        <span className="material-symbols-outlined text-green-400">check_circle</span>
        <span className="font-body-semibold">Settings saved successfully!</span>
      </div>
    </div>
  );
}