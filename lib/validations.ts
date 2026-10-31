import { z } from 'zod';

export const passwordValidation = z
  .string()
  .min(9, 'Password must be more than 8 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/`~]/, 'Must contain at least one special character');

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordValidation,
  name: z.string().min(2, 'Name is required'),
  companyName: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  vatNumber: z.string().optional(),
});

export const staffCreateSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name is required'),
  password: passwordValidation,
  role: z.enum(['STAFF', 'ADMIN']).default('STAFF'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: passwordValidation,
});

export const productVariantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Variant name is required'),
  priceExtra: z.number().default(0),
});

export const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  type: z.enum(['SOFTWARE', 'SERVICE', 'ADDON', 'MODULE']).default('SOFTWARE'),
  salesPrice: z.number().min(0, 'Sales price must be positive'),
  costPrice: z.number().min(0).default(0),
  notes: z.string().optional().nullable(),
  variants: z.array(productVariantSchema).optional(),
});

export const planSchema = z.object({
  name: z.string().min(2, 'Plan name is required'),
  code: z.string().min(2, 'Plan code is required'),
  cost: z.number().min(0, 'Cost must be positive'),
  billingInterval: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']).default('MONTHLY'),
  minQuantity: z.number().int().min(1).default(1),
  availableStartDate: z.string().optional().nullable(),
  availableEndDate: z.string().optional().nullable(),
  autoCloseOnEnd: z.boolean().default(false),
  allowEarlyClose: z.boolean().default(true),
  allowPause: z.boolean().default(true),
  allowRenewal: z.boolean().default(true),
});

export const quotationTemplateLineSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  productVariantId: z.string().optional().nullable(),
  quantity: z.number().int().min(1).default(1),
  unitPrice: z.number().min(0),
});

export const quotationTemplateSchema = z.object({
  name: z.string().min(2, 'Template name is required'),
  planId: z.string().min(1, 'Plan is required'),
  validityDays: z.number().int().min(1).default(14),
  notes: z.string().optional().nullable(),
  lines: z.array(quotationTemplateLineSchema).min(1, 'At least one line item is required'),
});

export const subscriptionLineSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  productVariantId: z.string().optional().nullable(),
  quantity: z.number().int().min(1).default(1),
  unitPrice: z.number().min(0),
  taxRate: z.number().min(0).default(0),
  notes: z.string().optional().nullable(),
});

export const subscriptionCreateSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  planId: z.string().min(1, 'Plan is required'),
  status: z.enum(['DRAFT', 'QUOTATION', 'CONFIRMED', 'ACTIVE']).default('DRAFT'),
  startDate: z.string().optional(),
  expiryDate: z.string().optional().nullable(),
  paymentTerms: z.string().default('Net 30'),
  autoRenew: z.boolean().default(true),
  discountRuleId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  lines: z.array(subscriptionLineSchema).min(1, 'At least one product line is required'),
});

export const taxRuleSchema = z.object({
  name: z.string().min(2, 'Tax name is required'),
  rate: z.number().min(0, 'Tax rate must be positive'),
  country: z.string().optional().nullable(),
  isDefault: z.boolean().default(false),
});

export const discountRuleSchema = z.object({
  code: z.string().min(2, 'Discount code is required').transform(v => v.toUpperCase()),
  description: z.string().min(2, 'Description is required'),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']).default('PERCENTAGE'),
  value: z.number().min(0, 'Discount value must be positive'),
  minPurchaseAmount: z.number().min(0).optional().nullable(),
  minQuantity: z.number().int().min(0).optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  maxUsageLimit: z.number().int().min(1).optional().nullable(),
  scope: z.enum(['ALL_SUBSCRIPTION', 'SPECIFIC_PRODUCT']).default('ALL_SUBSCRIPTION'),
  productId: z.string().optional().nullable(),
});

export const paymentRecordSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice is required'),
  amount: z.number().min(0.01, 'Payment amount must be greater than 0'),
  paymentDate: z.string().optional(),
  method: z.enum(['CREDIT_CARD', 'BANK_TRANSFER', 'STRIPE', 'CASH', 'CHECK', 'DIRECT_DEBIT']).default('BANK_TRANSFER'),
  transactionReference: z.string().min(1, 'Reference is required'),
  notes: z.string().optional().nullable(),
});

