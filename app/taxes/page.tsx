'use client';

import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/Modal';

export default function TaxesPage() {
  const [taxes, setTaxes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [rate, setRate] = useState<number>(20);
  const [country, setCountry] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchTaxes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/taxes');
      const data = await res.json();
      setTaxes(data.taxes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/taxes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          rate: Number(rate),
          country: country || null,
          isDefault,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        alert(d.error || 'Failed to create tax rule');
        return;
      }

      setIsModalOpen(false);
      setName('');
      setCountry('');
      await fetchTaxes();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text">Tax Rules Configuration</h1>
          <p className="text-xs text-muted mt-0.5">
            Admin controlled taxation rates: automatically computed and added to invoice lines during billing cycles.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3 py-1.5 text-xs font-medium bg-accent text-white rounded hover:opacity-90"
        >
          + Add Tax Rule
        </button>
      </div>

      {/* Tax Rules Table */}
      <div className="bg-surface rounded-card border border-border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-muted">Loading tax rules...</div>
        ) : taxes.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted">No tax rules configured yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Tax Rule Name</th>
                  <th className="text-right">Rate (%)</th>
                  <th>Country / Jurisdiction</th>
                  <th>Default Tax Status</th>
                </tr>
              </thead>
              <tbody>
                {taxes.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <div className="font-semibold text-text">{t.name}</div>
                    </td>
                    <td className="text-right font-bold text-text tabular-nums">
                      {t.rate}%
                    </td>
                    <td className="text-xs text-muted">
                      {t.country || 'Global / All Regions'}
                    </td>
                    <td>
                      {t.isDefault ? (
                        <span className="text-xs font-medium bg-positive/10 text-positive px-2 py-0.5 rounded">
                          Default Tax (Auto-assigned)
                        </span>
                      ) : (
                        <span className="text-xs text-muted">Optional</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Tax Rule">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-muted font-medium mb-1">Tax Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Standard VAT 20% or US State Tax"
              className="w-full p-2 border border-border rounded bg-ground text-text"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-muted font-medium mb-1">Tax Rate (%) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                placeholder="20.0"
                className="w-full p-2 border border-border rounded bg-ground text-text tabular-nums"
              />
            </div>

            <div>
              <label className="block text-muted font-medium mb-1">Country / Code</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value.toUpperCase())}
                placeholder="e.g. US, UK, DE"
                className="w-full p-2 border border-border rounded bg-ground text-text uppercase font-mono"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefaultTax"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
            />
            <label htmlFor="isDefaultTax" className="text-text font-medium">
              Set as Default Tax for all new contract items
            </label>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-1.5 border border-border rounded text-text hover:bg-raised"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 bg-accent text-white rounded font-medium hover:opacity-90 disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create Tax Rule'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

