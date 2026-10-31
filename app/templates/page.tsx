'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Modal } from '@/components/Modal';

export default function QuotationTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [planId, setPlanId] = useState('');
  const [validityDays, setValidityDays] = useState(14);
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<any[]>([{ productId: '', productVariantId: '', quantity: 1, unitPrice: 0 }]);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tmplRes, planRes, prodRes] = await Promise.all([
        fetch('/api/quotation-templates'),
        fetch('/api/plans'),
        fetch('/api/products'),
      ]);

      const tmplData = await tmplRes.json();
      const planData = await planRes.json();
      const prodData = await prodRes.json();

      setTemplates(tmplData.templates || []);
      setPlans(planData.plans || []);
      setProducts(prodData.products || []);

      if (planData.plans?.length > 0) setPlanId(planData.plans[0].id);
      if (prodData.products?.length > 0) {
        setLines([
          {
            productId: prodData.products[0].id,
            productVariantId: prodData.products[0].variants?.[0]?.id || '',
            quantity: 1,
            unitPrice: prodData.products[0].salesPrice,
          },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addLine = () => {
    if (products.length === 0) return;
    setLines([
      ...lines,
      {
        productId: products[0].id,
        productVariantId: products[0].variants?.[0]?.id || '',
        quantity: 1,
        unitPrice: products[0].salesPrice,
      },
    ]);
  };

  const removeLine = (idx: number) => {
    if (lines.length <= 1) return;
    setLines(lines.filter((_, i) => i !== idx));
  };

  const updateLineProduct = (idx: number, newProductId: string) => {
    const prod = products.find((p) => p.id === newProductId);
    if (!prod) return;
    const defaultVariant = prod.variants?.[0];
    const extra = defaultVariant ? defaultVariant.priceExtra : 0;
    const updated = [...lines];
    updated[idx] = {
      ...updated[idx],
      productId: newProductId,
      productVariantId: defaultVariant ? defaultVariant.id : '',
      unitPrice: prod.salesPrice + extra,
    };
    setLines(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/quotation-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          planId,
          validityDays: Number(validityDays),
          notes,
          lines: lines.map((l) => ({
            productId: l.productId,
            productVariantId: l.productVariantId || null,
            quantity: Number(l.quantity),
            unitPrice: Number(l.unitPrice),
          })),
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        alert(d.error || 'Failed to save template');
        return;
      }

      setIsModalOpen(false);
      setName('');
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
          <h1 className="text-xl font-bold tracking-tight text-text">Quotation Templates</h1>
          <p className="text-xs text-muted mt-0.5">
            Turnkey templates enabling sales reps to spin up custom quotes in seconds with preset plans and lines.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-subtle press-feedback transition-all flex items-center gap-1.5"
        >
          + Create Template
        </button>
      </div>

      {/* Templates List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 p-12 text-center text-xs text-muted">Loading quotation templates...</div>
        ) : templates.length === 0 ? (
          <div className="col-span-2 p-12 text-center text-xs text-muted">No quotation templates configured yet.</div>
        ) : (
          templates.map((tmpl) => {
            const templateSubtotal = tmpl.lines.reduce(
              (acc: number, l: any) => acc + l.quantity * l.unitPrice,
              0
            );

            return (
              <div key={tmpl.id} className="bg-surface p-5 rounded-card border border-border flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-sm font-bold text-text">{tmpl.name}</h2>
                      <div className="text-xs text-muted mt-0.5">
                        Plan: <strong>{tmpl.plan.name}</strong> (₹{tmpl.plan.cost}/{tmpl.plan.billingInterval.toLowerCase()})
                      </div>
                    </div>
                    <span className="text-xs bg-raised border border-border px-2 py-0.5 rounded text-muted">
                      Valid {tmpl.validityDays} Days
                    </span>
                  </div>

                  {tmpl.notes && (
                    <p className="text-xs text-muted mt-2 italic bg-ground p-2 rounded border border-rule">
                      {tmpl.notes}
                    </p>
                  )}

                  {/* Preset Lines */}
                  <div className="mt-3 pt-3 border-t border-rule space-y-1.5">
                    <div className="text-[11px] font-semibold text-muted uppercase tracking-wider">
                      Preset Line Items
                    </div>
                    {tmpl.lines.map((line: any) => (
                      <div key={line.id} className="flex justify-between text-xs">
                        <span className="text-text">
                          {line.quantity}x {line.product.name}
                          {line.variant && <span className="text-chartHue ml-1">({line.variant.name})</span>}
                        </span>
                        <span className="tabular-nums font-medium text-text">
                          ₹{(line.quantity * line.unitPrice).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-rule flex items-center justify-between">
                  <div>
                    <span className="text-xs text-muted">Bundle Total: </span>
                    <span className="text-sm font-bold text-text tabular-nums">
                      ₹{templateSubtotal.toFixed(2)}
                    </span>
                  </div>

                  <Link
                    href={`/subscriptions/new?templateId=${tmpl.id}`}
                    className="px-3 py-1.5 text-xs font-semibold bg-chartHue text-white rounded hover:opacity-90 transition-opacity"
                  >
                    Use in Quote →
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Template Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Quotation Template">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-muted font-medium mb-1">Template Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Standard Enterprise Tier"
              className="w-full p-2 border border-border rounded bg-ground text-text"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-muted font-medium mb-1">Plan *</label>
              <select
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                className="w-full p-2 border border-border rounded bg-ground text-text"
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (₹{p.cost})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-muted font-medium mb-1">Validity (Days) *</label>
              <input
                type="number"
                min="1"
                required
                value={validityDays}
                onChange={(e) => setValidityDays(parseInt(e.target.value) || 14)}
                className="w-full p-2 border border-border rounded bg-ground text-text tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block text-muted font-medium mb-1">Notes / Description</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Description of template"
              className="w-full p-2 border border-border rounded bg-ground text-text"
            />
          </div>

          {/* Lines */}
          <div className="pt-2 border-t border-rule space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-text">Preset Product Lines</label>
              <button
                type="button"
                onClick={addLine}
                className="px-2 py-0.5 bg-raised border border-border rounded text-text hover:bg-ground"
              >
                + Add Line
              </button>
            </div>

            {lines.map((l, idx) => {
              const product = products.find((p) => p.id === l.productId);
              return (
                <div key={idx} className="flex items-center gap-2">
                  <select
                    value={l.productId}
                    onChange={(e) => updateLineProduct(idx, e.target.value)}
                    className="flex-1 p-1.5 border border-border rounded bg-ground text-text"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={l.productVariantId}
                    onChange={(e) => {
                      const updated = [...lines];
                      updated[idx].productVariantId = e.target.value;
                      setLines(updated);
                    }}
                    className="w-36 p-1.5 border border-border rounded bg-ground text-text"
                  >
                    <option value="">Base Edition</option>
                    {product?.variants?.map((v: any) => (
                      <option key={v.id} value={v.id}>
                        {v.name} (+₹{v.priceExtra})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={l.quantity}
                    onChange={(e) => {
                      const updated = [...lines];
                      updated[idx].quantity = parseInt(e.target.value) || 1;
                      setLines(updated);
                    }}
                    className="w-16 p-1.5 border border-border rounded bg-ground text-text tabular-nums"
                  />

                  <input
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    value={l.unitPrice}
                    onChange={(e) => {
                      const updated = [...lines];
                      updated[idx].unitPrice = parseFloat(e.target.value) || 0;
                      setLines(updated);
                    }}
                    className="w-20 p-1.5 border border-border rounded bg-ground text-text tabular-nums"
                  />

                  {lines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLine(idx)}
                      className="text-negative text-xs hover:underline px-1"
                    >
                      Remove
                    </button>
                  )}
                </div>
              );
            })}
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
              {saving ? 'Saving...' : 'Save Template'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
