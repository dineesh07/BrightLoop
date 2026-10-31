'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ProductVariant {
  id: string;
  name: string;
  priceExtra: number;
}

interface Product {
  id: string;
  name: string;
  salesPrice: number;
  variants: ProductVariant[];
}

interface Plan {
  id: string;
  name: string;
  cost: number;
  billingInterval: string;
  minQuantity: number;
}

interface QuotationTemplate {
  id: string;
  name: string;
  planId: string;
  validityDays: number;
  lines: {
    productId: string;
    productVariantId: string | null;
    quantity: number;
    unitPrice: number;
  }[];
}

interface LineItem {
  productId: string;
  productVariantId: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  notes: string;
}

export default function NewSubscriptionPage() {
  const router = useRouter();

  const [customers, setCustomers] = useState<any[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [templates, setTemplates] = useState<QuotationTemplate[]>([]);
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [taxes, setTaxes] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [customerId, setCustomerId] = useState<string>('');
  const [planId, setPlanId] = useState<string>('');
  const [initialStatus, setInitialStatus] = useState<string>('QUOTATION');
  const [paymentTerms, setPaymentTerms] = useState<string>('Net 30');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [autoRenew, setAutoRenew] = useState<boolean>(true);
  const [discountRuleId, setDiscountRuleId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [lines, setLines] = useState<LineItem[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [custRes, planRes, prodRes, tmplRes, discRes, taxRes] = await Promise.all([
          fetch('/api/customers').then((r) => r.json()),
          fetch('/api/plans').then((r) => r.json()),
          fetch('/api/products').then((r) => r.json()),
          fetch('/api/quotation-templates').then((r) => r.json()),
          fetch('/api/discounts').then((r) => r.json()),
          fetch('/api/taxes').then((r) => r.json()),
        ]);

        setCustomers(custRes.customers || []);
        setPlans(planRes.plans || []);
        setProducts(prodRes.products || []);
        setTemplates(tmplRes.templates || []);
        setDiscounts(discRes.discounts || []);
        setTaxes(taxRes.taxes || []);

        if (custRes.customers?.length > 0) setCustomerId(custRes.customers[0].id);
        if (planRes.plans?.length > 0) setPlanId(planRes.plans[0].id);

        // Initial default line
        if (prodRes.products?.length > 0) {
          const firstProd = prodRes.products[0];
          setLines([
            {
              productId: firstProd.id,
              productVariantId: firstProd.variants?.[0]?.id || '',
              quantity: 1,
              unitPrice: firstProd.salesPrice,
              taxRate: 20,
              notes: '',
            },
          ]);
        }
      } catch (err) {
        console.error('Error fetching data for form', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // When template is selected, instantiate its plan and lines
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (!templateId) return;

    const t = templates.find((item) => item.id === templateId);
    if (!t) return;

    setPlanId(t.planId);
    setInitialStatus('QUOTATION');

    // Calculate quote expiry from validity days
    const exp = new Date();
    exp.setDate(exp.getDate() + t.validityDays);
    setExpiryDate(exp.toISOString().split('T')[0]);

    // Populate lines from template
    const templateLines: LineItem[] = t.lines.map((l) => ({
      productId: l.productId,
      productVariantId: l.productVariantId || '',
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      taxRate: 20,
      notes: 'Imported from Quotation Template',
    }));

    setLines(templateLines);
  };

  const handleProductChange = (index: number, newProductId: string) => {
    const prod = products.find((p) => p.id === newProductId);
    if (!prod) return;

    const updated = [...lines];
    const defaultVariant = prod.variants?.[0];
    const extra = defaultVariant ? defaultVariant.priceExtra : 0;

    updated[index] = {
      ...updated[index],
      productId: newProductId,
      productVariantId: defaultVariant ? defaultVariant.id : '',
      unitPrice: prod.salesPrice + extra,
    };
    setLines(updated);
  };

  const handleVariantChange = (index: number, variantId: string) => {
    const line = lines[index];
    const prod = products.find((p) => p.id === line.productId);
    if (!prod) return;

    const variant = prod.variants?.find((v) => v.id === variantId);
    const extra = variant ? variant.priceExtra : 0;

    const updated = [...lines];
    updated[index] = {
      ...updated[index],
      productVariantId: variantId,
      unitPrice: prod.salesPrice + extra,
    };
    setLines(updated);
  };

  const updateLineField = (index: number, field: keyof LineItem, val: any) => {
    const updated = [...lines];
    updated[index] = { ...updated[index], [field]: val };
    setLines(updated);
  };

  const addLine = () => {
    if (products.length === 0) return;
    const prod = products[0];
    const variant = prod.variants?.[0];
    setLines([
      ...lines,
      {
        productId: prod.id,
        productVariantId: variant ? variant.id : '',
        quantity: 1,
        unitPrice: prod.salesPrice + (variant?.priceExtra || 0),
        taxRate: 20,
        notes: '',
      },
    ]);
  };

  const removeLine = (index: number) => {
    if (lines.length <= 1) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => {
    return lines.reduce((acc, l) => acc + l.quantity * l.unitPrice, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        customerId,
        planId,
        status: initialStatus,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        expiryDate: expiryDate ? new Date(expiryDate).toISOString() : null,
        paymentTerms,
        autoRenew,
        discountRuleId: discountRuleId || null,
        notes,
        lines: lines.map((l) => ({
          productId: l.productId,
          productVariantId: l.productVariantId || null,
          quantity: Number(l.quantity),
          unitPrice: Number(l.unitPrice),
          taxRate: Number(l.taxRate),
          notes: l.notes,
        })),
      };

      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const d = await res.json();
        alert(d.error || 'Failed to create subscription');
        return;
      }

      const resData = await res.json();
      router.push(`/subscriptions/${resData.subscription.id}`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-muted">Loading subscription setup...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text">
            Create Subscription or Quotation
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Prepare custom offers or launch from an existing quotation template.
          </p>
        </div>
        <Link
          href="/subscriptions"
          className="px-3 py-1.5 text-xs text-muted hover:text-text border border-border rounded hover:bg-raised"
        >
          Cancel
        </Link>
      </div>

      {/* Template Preset Selector */}
      <div className="p-4 bg-surface rounded-card border border-border space-y-2">
        <label className="block text-xs font-semibold text-text">
          Start from Quotation Template (Optional)
        </label>
        <p className="text-xs text-muted">
          Sales reps can populate pre-configured enterprise or growth packages instantly.
        </p>
        <div className="flex items-center gap-3">
          <select
            value={selectedTemplateId}
            onChange={(e) => handleTemplateSelect(e.target.value)}
            className="w-full max-w-md p-2 text-xs border border-border rounded bg-ground text-text"
          >
            <option value="">-- Build custom quote from scratch --</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} (Valid {t.validityDays} days)
              </option>
            ))}
          </select>
          {selectedTemplateId && (
            <span className="text-xs text-positive font-medium">Template lines imported</span>
          )}
        </div>
      </div>

      {/* Subscription Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-surface p-5 rounded-card border border-border space-y-4">
          <h2 className="text-sm font-semibold text-text pb-2 border-b border-rule">
            1. Customer & Plan Configuration
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-muted font-medium mb-1">Customer Account *</label>
              <select
                required
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full p-2 border border-border rounded bg-ground text-text"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.companyName || c.email} ({c.country || 'Global'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-muted font-medium mb-1">Billing Plan *</label>
              <select
                required
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                className="w-full p-2 border border-border rounded bg-ground text-text"
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (₹{p.cost}/{p.billingInterval.toLowerCase()} · Min qty: {p.minQuantity})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-muted font-medium mb-1">Initial Lifecycle Status</label>
              <select
                value={initialStatus}
                onChange={(e) => setInitialStatus(e.target.value)}
                className="w-full p-2 border border-border rounded bg-ground text-text"
              >
                <option value="QUOTATION">Quotation (Offer for customer sign-off)</option>
                <option value="DRAFT">Draft</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="ACTIVE">Active (Immediate billing schedule)</option>
              </select>
            </div>

            <div>
              <label className="block text-muted font-medium mb-1">Payment Terms</label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full p-2 border border-border rounded bg-ground text-text"
              >
                <option value="Immediate">Immediate / Due upon receipt</option>
                <option value="Net 15">Net 15 Days</option>
                <option value="Net 30">Net 30 Days</option>
                <option value="Net 60">Net 60 Days</option>
              </select>
            </div>

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
              <label className="block text-muted font-medium mb-1">Expiry / Valid Until Date</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full p-2 border border-border rounded bg-ground text-text"
              />
            </div>

            <div>
              <label className="block text-muted font-medium mb-1">Discount Rule (Optional)</label>
              <select
                value={discountRuleId}
                onChange={(e) => setDiscountRuleId(e.target.value)}
                className="w-full p-2 border border-border rounded bg-ground text-text"
              >
                <option value="">-- No Discount Applied --</option>
                {discounts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code} ({d.discountType === 'PERCENTAGE' ? `${d.value}%` : `₹${d.value}`} off)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="autoRenew"
                checked={autoRenew}
                onChange={(e) => setAutoRenew(e.target.checked)}
                className="rounded border-border"
              />
              <label htmlFor="autoRenew" className="text-text font-medium">
                Auto-Renew on each billing period
              </label>
            </div>
          </div>
        </div>

        {/* Contract Lines */}
        <div className="bg-surface p-5 rounded-card border border-border space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-rule">
            <h2 className="text-sm font-semibold text-text">
              2. Product &amp; Variant Lines
            </h2>
            <button
              type="button"
              onClick={addLine}
              className="px-2.5 py-1 text-xs bg-raised border border-border rounded hover:bg-ground font-medium"
            >
              + Add Product Line
            </button>
          </div>

          <div className="space-y-3">
            {lines.map((line, idx) => {
              const product = products.find((p) => p.id === line.productId);
              const lineTotal = line.quantity * line.unitPrice;

              return (
                <div
                  key={idx}
                  className="p-3 border border-border rounded bg-ground flex flex-col md:flex-row gap-3 items-start md:items-center text-xs"
                >
                  {/* Product */}
                  <div className="flex-1">
                    <label className="block text-muted mb-1">Product</label>
                    <select
                      value={line.productId}
                      onChange={(e) => handleProductChange(idx, e.target.value)}
                      className="w-full p-1.5 border border-border rounded bg-surface text-text"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (₹{p.salesPrice})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Variant */}
                  <div className="w-48">
                    <label className="block text-muted mb-1">Variant (e.g. Odoo +₹560)</label>
                    <select
                      value={line.productVariantId}
                      onChange={(e) => handleVariantChange(idx, e.target.value)}
                      className="w-full p-1.5 border border-border rounded bg-surface text-text"
                    >
                      <option value="">No Variant (Base Price)</option>
                      {product?.variants?.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} (+₹{v.priceExtra})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Qty */}
                  <div className="w-20">
                    <label className="block text-muted mb-1">Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={line.quantity}
                      onChange={(e) => updateLineField(idx, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-full p-1.5 border border-border rounded bg-surface text-text tabular-nums"
                    />
                  </div>

                  {/* Unit Price */}
                  <div className="w-24">
                    <label className="block text-muted mb-1">Unit Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={line.unitPrice}
                      onChange={(e) => updateLineField(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-full p-1.5 border border-border rounded bg-surface text-text tabular-nums"
                    />
                  </div>

                  {/* Tax */}
                  <div className="w-28">
                    <label className="block text-muted mb-1">GST Tax (%)</label>
                    <select
                      value={line.taxRate}
                      onChange={(e) => updateLineField(idx, 'taxRate', parseFloat(e.target.value) || 0)}
                      className="w-full p-1.5 border border-border rounded bg-surface text-text tabular-nums"
                    >
                      <option value="0">0% (Exempt)</option>
                      <option value="5">5% (GST)</option>
                      <option value="12">12% (GST)</option>
                      <option value="18">18% (Standard GST)</option>
                      <option value="28">28% (GST)</option>
                    </select>
                  </div>

                  {/* Subtotal & Delete */}
                  <div className="w-28 text-right">
                    <label className="block text-muted mb-1">Line Total</label>
                    <div className="font-semibold text-text tabular-nums pt-1.5">
                      ₹{lineTotal.toFixed(2)}
                    </div>
                  </div>

                  {lines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLine(idx)}
                      className="text-negative hover:underline pt-5 px-1 text-xs"
                      title="Remove line"
                    >
                      Remove
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-rule text-xs">
            <span className="text-muted">Subtotal across lines (excl. tax &amp; discounts):</span>
            <span className="text-sm font-bold text-text tabular-nums">
              ₹{calculateSubtotal().toFixed(2)}
            </span>
          </div>
        </div>

        {/* Notes & Actions */}
        <div className="bg-surface p-5 rounded-card border border-border space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Internal Notes & Terms</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Approved by Sales Rep Sarah, standard 14-day quotation validity window."
              className="w-full p-2 text-xs border border-border rounded bg-ground text-text"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/subscriptions"
              className="px-4 py-2 text-xs border border-border rounded text-text hover:bg-raised"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold bg-accent text-white rounded hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? 'Generating...' : `Generate ${initialStatus === 'QUOTATION' ? 'Quotation' : 'Subscription'}`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
