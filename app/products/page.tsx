'use client';

import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/Modal';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState('SOFTWARE');
  const [salesPrice, setSalesPrice] = useState<number>(0);
  const [costPrice, setCostPrice] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [variants, setVariants] = useState<{ name: string; priceExtra: number }[]>([
    { name: 'Standard Edition', priceExtra: 0 },
  ]);
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addVariantField = () => {
    setVariants([...variants, { name: '', priceExtra: 0 }]);
  };

  const removeVariantField = (idx: number) => {
    setVariants(variants.filter((_, i) => i !== idx));
  };

  const updateVariant = (idx: number, field: 'name' | 'priceExtra', value: any) => {
    const updated = [...variants];
    updated[idx] = { ...updated[idx], [field]: value };
    setVariants(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          type,
          salesPrice: Number(salesPrice),
          costPrice: Number(costPrice),
          notes,
          variants: variants.filter((v) => v.name.trim() !== ''),
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        alert(d.error || 'Failed to save product');
        return;
      }

      setIsModalOpen(false);
      setName('');
      setSalesPrice(0);
      setCostPrice(0);
      setNotes('');
      setVariants([{ name: 'Standard Edition', priceExtra: 0 }]);
      await fetchProducts();
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
          <h1 className="text-xl font-bold tracking-tight text-text">Products &amp; Variants Catalog</h1>
          <p className="text-xs text-muted mt-0.5">
            Configure software suites, add-ons, modules and brand variants (e.g. Odoo Brand +₹560).
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3 py-1.5 text-xs font-medium bg-accent text-white rounded hover:opacity-90"
        >
          + Add Product
        </button>
      </div>

      {/* Products Grid / Table */}
      <div className="bg-surface rounded-card border border-border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-muted">Loading product catalog...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted">No products configured yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th className="text-right">Sales Price</th>
                  <th className="text-right">Cost Price</th>
                  <th>Configured Variants & Brand Add-ons</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="font-semibold text-text">{p.name}</div>
                    </td>
                    <td>
                      <span className="text-[11px] font-mono uppercase bg-raised px-1.5 py-0.5 rounded text-muted">
                        {p.type}
                      </span>
                    </td>
                    <td className="text-right font-bold text-text tabular-nums">
                      ₹{p.salesPrice.toFixed(2)}
                    </td>
                    <td className="text-right text-muted tabular-nums">
                      ₹{p.costPrice.toFixed(2)}
                    </td>
                    <td>
                      {p.variants && p.variants.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {p.variants.map((v: any) => (
                            <span
                              key={v.id}
                              className="text-xs bg-ground border border-border px-2 py-0.5 rounded text-text"
                            >
                              <strong>{v.name}</strong>
                              {v.priceExtra > 0 ? (
                                <span className="text-chartHue ml-1 font-semibold">
                                  (+₹{v.priceExtra})
                                </span>
                              ) : (
                                <span className="text-muted ml-1 font-normal">(+₹0)</span>
                              )}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted italic">Standard only</span>
                      )}
                    </td>
                    <td className="text-xs text-muted max-w-xs truncate">{p.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Launch New Product & Variants">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-muted font-medium mb-1">Product Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Brightloop Enterprise ERP"
              className="w-full p-2 border border-border rounded bg-ground text-text"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-muted font-medium mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-2 border border-border rounded bg-ground text-text"
              >
                <option value="SOFTWARE">Software</option>
                <option value="ADDON">Add-on</option>
                <option value="MODULE">Module</option>
                <option value="SERVICE">Service</option>
              </select>
            </div>

            <div>
              <label className="block text-muted font-medium mb-1">Base Price (₹ INR) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={salesPrice}
                onChange={(e) => setSalesPrice(parseFloat(e.target.value) || 0)}
                className="w-full p-2 border border-border rounded bg-ground text-text tabular-nums"
              />
            </div>

            <div>
              <label className="block text-muted font-medium mb-1">Cost Price (₹ INR)</label>
              <input
                type="number"
                step="0.01"
                value={costPrice}
                onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                className="w-full p-2 border border-border rounded bg-ground text-text tabular-nums"
              />
            </div>
          </div>

          {/* Variants */}
          <div className="pt-2 border-t border-rule space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-text">Product Variants (e.g. Brand Editions)</label>
              <button
                type="button"
                onClick={addVariantField}
                className="px-2 py-0.5 bg-raised border border-border rounded text-text hover:bg-ground"
              >
                + Add Variant
              </button>
            </div>

            {variants.map((v, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Variant name (e.g. Odoo Edition)"
                  value={v.name}
                  onChange={(e) => updateVariant(i, 'name', e.target.value)}
                  className="flex-1 p-1.5 border border-border rounded bg-ground text-text"
                />
                <div className="flex items-center gap-1 w-36">
                  <span className="text-muted">+₹</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Extra price"
                    value={v.priceExtra}
                    onChange={(e) => updateVariant(i, 'priceExtra', parseFloat(e.target.value) || 0)}
                    className="w-full p-1.5 border border-border rounded bg-ground text-text tabular-nums"
                  />
                </div>
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariantField(i)}
                    className="text-negative text-xs hover:underline px-1"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          <div>
            <label className="block text-muted font-medium mb-1">Notes / Description</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal documentation and provisioning details"
              className="w-full p-2 border border-border rounded bg-ground text-text"
            />
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
              {saving ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
