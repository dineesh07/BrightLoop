'use client';

import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/Modal';
import { StatusBadge } from '@/components/StatusBadge';
import { formatINR } from '@/lib/currency';

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
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-muted">Loading discount rules...</div>
        ) : discounts.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted">No discount rules configured yet.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-[28%]">Code &amp; Scope</th>
                <th className="py-3.5 px-4 w-[16%]">Discount Value</th>
                <th className="py-3.5 px-4 w-[24%]">Eligibility Criteria</th>
                <th className="py-3.5 px-4 w-[20%]">Usage &amp; Validity</th>
                <th className="py-3.5 px-4 w-[12%] text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
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
                  <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/70">
                        {d.code}
                      </span>
                      <div className="text-xs font-semibold text-slate-900 mt-1.5">{d.description}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {d.scope === 'ALL_SUBSCRIPTION' ? (
                          <span>Whole Subscription</span>
                        ) : (
                          <span>Target: {d.product ? d.product.name : 'Specific Product'}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-xs font-bold text-slate-900 tabular-nums">
                        {d.discountType === 'PERCENTAGE' ? `${d.value}% Off` : `${formatINR(d.value)} Off`}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {d.discountType === 'PERCENTAGE' ? 'Percentage concession' : 'Fixed credit'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 leading-relaxed">
                      {d.minQuantity ? (
                        <div>
                          Min seats: <span className="font-semibold text-slate-800">{d.minQuantity}</span>
                        </div>
                      ) : null}
                      {d.minPurchaseAmount ? (
                        <div>
                          Min spend: <span className="font-semibold text-slate-800">{formatINR(d.minPurchaseAmount)}</span>
                        </div>
                      ) : null}
                      {!d.minQuantity && !d.minPurchaseAmount && (
                        <span className="text-slate-400 italic">No minimum spend/qty</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      <div className="font-medium text-slate-800 tabular-nums">
                        {d.usageCount} {d.maxUsageLimit ? `/ ${d.maxUsageLimit} redemptions` : 'redemptions'}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {d.startDate || d.endDate ? (
                          <span>
                            {d.startDate ? new Date(d.startDate).toLocaleDateString() : 'Now'} —{' '}
                            {d.endDate ? new Date(d.endDate).toLocaleDateString() : 'Forever'}
                          </span>
                        ) : (
                          <span>Unlimited duration</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <StatusBadge status={status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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

