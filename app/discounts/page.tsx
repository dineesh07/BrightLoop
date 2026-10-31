'use client';

import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/Modal';
import { StatusBadge } from '@/components/StatusBadge';

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState('PERCENTAGE');
  const [value, setValue] = useState<number>(10);
  const [minPurchaseAmount, setMinPurchaseAmount] = useState<string>('');
  const [minQuantity, setMinQuantity] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [maxUsageLimit, setMaxUsageLimit] = useState<string>('');
  const [scope, setScope] = useState('ALL_SUBSCRIPTION');
  const [productId, setProductId] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [discRes, prodRes] = await Promise.all([
        fetch('/api/discounts'),
        fetch('/api/products'),
      ]);
      const discData = await discRes.json();
      const prodData = await prodRes.json();
      setDiscounts(discData.discounts || []);
      setProducts(prodData.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          description,
          discountType,
          value: Number(value),
          minPurchaseAmount: minPurchaseAmount ? parseFloat(minPurchaseAmount) : null,
          minQuantity: minQuantity ? parseInt(minQuantity) : null,
          startDate: startDate || null,
          endDate: endDate || null,
          maxUsageLimit: maxUsageLimit ? parseInt(maxUsageLimit) : null,
          scope,
          productId: scope === 'SPECIFIC_PRODUCT' ? productId : null,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        alert(d.error || 'Failed to create discount rule');
        return;
      }

      setIsModalOpen(false);
      setCode('');
      setDescription('');
      await loadData();
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
          <h1 className="text-xl font-bold tracking-tight text-text">Discount Rules & Concessions</h1>
          <p className="text-xs text-muted mt-0.5">
            Admin configured discounts: auto-applied on invoice generation, enforced by quantity, min purchase, date, or limit.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-subtle press-feedback transition-all flex items-center gap-1.5"
        >
          + Create Discount Rule
        </button>
      </div>

      {/* Discounts Table */}
      <div className="bg-surface rounded-card border border-border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-muted">Loading discount rules...</div>
        ) : discounts.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted">No discount rules configured yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Description</th>
                  <th>Discount Value</th>
                  <th>Scope</th>
                  <th>Eligibility Criteria</th>
                  <th className="text-center">Usage Count</th>
                  <th>Validity Dates</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {discounts.map((d) => {
                  const now = new Date();
                  const isExpired = d.endDate && new Date(d.endDate) < now;
                  const isLimitReached = d.maxUsageLimit && d.usageCount >= d.maxUsageLimit;
                  const status = isExpired
                    ? 'EXPIRED'
                    : isLimitReached
                    ? 'MAXED'
                    : d.active
                    ? 'ACTIVE'
                    : 'INACTIVE';

                  return (
                    <tr key={d.id}>
                      <td className="font-mono text-xs font-bold text-chartHue">
                        {d.code}
                      </td>
                      <td className="text-xs font-medium text-text">{d.description}</td>
                      <td className="text-xs font-bold text-text tabular-nums">
                        {d.discountType === 'PERCENTAGE' ? `${d.value}% Off` : `₹${d.value.toFixed(2)} Off`}
                      </td>
                      <td>
                        {d.scope === 'ALL_SUBSCRIPTION' ? (
                          <span className="text-xs text-text">Whole Subscription</span>
                        ) : (
                          <span className="text-xs text-muted">
                            Specific: {d.product ? d.product.name : 'Targeted Product'}
                          </span>
                        )}
                      </td>
                      <td className="text-xs text-muted">
                        {d.minQuantity && <div>Min Qty: {d.minQuantity} seats</div>}
                        {d.minPurchaseAmount && <div>Min Spend: ₹{d.minPurchaseAmount.toFixed(2)}</div>}
                        {!d.minQuantity && !d.minPurchaseAmount && <div>None (Unconditional)</div>}
                      </td>
                      <td className="text-center text-xs tabular-nums font-medium text-text">
                        {d.usageCount} {d.maxUsageLimit ? `/ ${d.maxUsageLimit}` : 'times'}
                      </td>
                      <td className="text-xs text-muted">
                        {d.startDate || d.endDate ? (
                          <span>
                            {d.startDate ? new Date(d.startDate).toLocaleDateString() : 'Start'} —{' '}
                            {d.endDate ? new Date(d.endDate).toLocaleDateString() : 'Forever'}
                          </span>
                        ) : (
                          <span>Unlimited duration</span>
                        )}
                      </td>
                      <td>
                        <StatusBadge status={status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Configure Discount Rule">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-muted font-medium mb-1">Coupon / Promo Code *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. VOLUME10"
                className="w-full p-2 border border-border rounded bg-ground text-text font-mono"
              />
            </div>

            <div>
              <label className="block text-muted font-medium mb-1">Discount Type *</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="w-full p-2 border border-border rounded bg-ground text-text"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED_AMOUNT">Fixed Amount (₹ INR)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-muted font-medium mb-1">Description *</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 10% volume discount for taking 5 or more seats"
              className="w-full p-2 border border-border rounded bg-ground text-text"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-muted font-medium mb-1">Discount Value *</label>
              <input
                type="number"
                step="0.01"
                required
                value={value}
                onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
                placeholder="e.g. 10"
                className="w-full p-2 border border-border rounded bg-ground text-text tabular-nums"
              />
            </div>

            <div>
              <label className="block text-muted font-medium mb-1">Min Seats / Quantity</label>
              <input
                type="number"
                value={minQuantity}
                onChange={(e) => setMinQuantity(e.target.value)}
                placeholder="e.g. 5"
                className="w-full p-2 border border-border rounded bg-ground text-text tabular-nums"
              />
            </div>

            <div>
              <label className="block text-muted font-medium mb-1">Min Spend (₹ INR)</label>
              <input
                type="number"
                step="0.01"
                value={minPurchaseAmount}
                onChange={(e) => setMinPurchaseAmount(e.target.value)}
                placeholder="e.g. 500"
                className="w-full p-2 border border-border rounded bg-ground text-text tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-muted font-medium mb-1">Application Scope</label>
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                className="w-full p-2 border border-border rounded bg-ground text-text"
              >
                <option value="ALL_SUBSCRIPTION">Whole Subscription Subtotal</option>
                <option value="SPECIFIC_PRODUCT">Specific Product Line</option>
              </select>
            </div>

            {scope === 'SPECIFIC_PRODUCT' && (
              <div>
                <label className="block text-muted font-medium mb-1">Target Product</label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full p-2 border border-border rounded bg-ground text-text"
                >
                  <option value="">-- Choose Product --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-muted font-medium mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 border border-border rounded bg-ground text-text"
              />
            </div>

            <div>
              <label className="block text-muted font-medium mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 border border-border rounded bg-ground text-text"
              />
            </div>

            <div>
              <label className="block text-muted font-medium mb-1">Max Usages</label>
              <input
                type="number"
                value={maxUsageLimit}
                onChange={(e) => setMaxUsageLimit(e.target.value)}
                placeholder="e.g. 50"
                className="w-full p-2 border border-border rounded bg-ground text-text tabular-nums"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-medium border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors press-feedback"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-subtle press-feedback disabled:opacity-50 transition-all"
            >
              {saving ? 'Creating...' : 'Create Discount'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

