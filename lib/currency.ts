/**
 * Indian Rupee (INR - ₹) Formatting Utilities for Brightloop Software
 */

export function formatINR(
  amount: number | null | undefined,
  options?: {
    showDecimals?: boolean;
    compact?: boolean;
    symbol?: boolean;
  }
): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return options?.symbol === false ? '0.00' : '₹0.00';
  }

  const showDecimals = options?.showDecimals ?? true;
  const symbol = options?.symbol ?? true;

  if (options?.compact) {
    if (Math.abs(amount) >= 10000000) {
      const cr = (amount / 10000000).toFixed(2);
      return symbol ? `₹${cr} Cr` : `${cr} Cr`;
    }
    if (Math.abs(amount) >= 100000) {
      const lakh = (amount / 100000).toFixed(2);
      return symbol ? `₹${lakh} L` : `${lakh} L`;
    }
    if (Math.abs(amount) >= 1000) {
      const k = (amount / 1000).toFixed(1);
      return symbol ? `₹${k}k` : `${k}k`;
    }
  }

  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);

  return symbol ? `₹${formatted}` : formatted;
}

export function parseINR(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned) || 0;
}

