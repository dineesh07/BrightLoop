const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Brightloop database...');

  // Clean existing data
  await prisma.payment.deleteMany({});
  await prisma.invoiceLine.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.subscriptionLine.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.quotationTemplateLine.deleteMany({});
  await prisma.quotationTemplate.deleteMany({});
  await prisma.discountRule.deleteMany({});
  await prisma.taxRule.deleteMany({});
  await prisma.plan.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.billingLog.deleteMany({});

  const adminPass = await bcrypt.hash('Admin@12345!', 10);
  const staffPass = await bcrypt.hash('Staff@12345!', 10);
  const customerPass = await bcrypt.hash('Customer@12345!', 10);

  // 1. Users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@brightloop.com',
      name: 'Elena Rostova',
      passwordHash: adminPass,
      role: 'ADMIN',
      companyName: 'Brightloop Software HQ',
      currency: 'USD',
    },
  });

  const staff1 = await prisma.user.create({
    data: {
      email: 'sarah.sales@brightloop.com',
      name: 'Sarah Jenkins',
      passwordHash: staffPass,
      role: 'STAFF',
      companyName: 'Brightloop Sales Team',
      currency: 'USD',
    },
  });

  const staff2 = await prisma.user.create({
    data: {
      email: 'marcus.ops@brightloop.com',
      name: 'Marcus Vance',
      passwordHash: staffPass,
      role: 'STAFF',
      companyName: 'Brightloop Customer Operations',
      currency: 'USD',
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      email: 'alex@nordicretail.com',
      name: 'Alex Lindqvist',
      passwordHash: customerPass,
      role: 'CUSTOMER',
      companyName: 'Nordic Retail AB',
      phone: '+46 8 123 4567',
      address: 'Kungsgatan 14',
      city: 'Stockholm',
      country: 'Sweden',
      vatNumber: 'SE556123456701',
      currency: 'USD',
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: 'elena@apexlogistics.io',
      name: 'Elena Morales',
      passwordHash: customerPass,
      role: 'CUSTOMER',
      companyName: 'Apex Logistics Global Inc.',
      phone: '+1 415 889 2031',
      address: '500 Howard Street, Suite 400',
      city: 'San Francisco',
      country: 'United States',
      vatNumber: 'US-CA-94105-88',
      currency: 'USD',
    },
  });

  const customer3 = await prisma.user.create({
    data: {
      email: 'liam@studiokraft.de',
      name: 'Liam Weber',
      passwordHash: customerPass,
      role: 'CUSTOMER',
      companyName: 'Studio Kraft GmbH',
      phone: '+49 30 891 0293',
      address: 'Friedrichstraße 180',
      city: 'Berlin',
      country: 'Germany',
      vatNumber: 'DE814529182',
      currency: 'USD',
    },
  });

  const customer4 = await prisma.user.create({
    data: {
      email: 'chloe@urbanfleet.co',
      name: 'Chloe Dupont',
      passwordHash: customerPass,
      role: 'CUSTOMER',
      companyName: 'Urban Fleet Logistics',
      phone: '+33 1 42 68 55 00',
      address: '24 Rue de la Paix',
      city: 'Paris',
      country: 'France',
      vatNumber: 'FR849182746',
      currency: 'USD',
    },
  });

  console.log('Created users.');

  // 2. Tax Rules
  const vat20 = await prisma.taxRule.create({
    data: {
      name: 'Standard VAT 20%',
      rate: 20.0,
      country: 'UK',
      isDefault: true,
      active: true,
    },
  });

  const vat19 = await prisma.taxRule.create({
    data: {
      name: 'EU VAT 19%',
      rate: 19.0,
      country: 'DE',
      isDefault: false,
      active: true,
    },
  });

  const usTax = await prisma.taxRule.create({
    data: {
      name: 'US Sales Tax 8.25%',
      rate: 8.25,
      country: 'US',
      isDefault: false,
      active: true,
    },
  });

  const zeroTax = await prisma.taxRule.create({
    data: {
      name: 'Zero Rated 0%',
      rate: 0.0,
      country: 'GLOBAL',
      isDefault: false,
      active: true,
    },
  });

  // 3. Products & Variants
  const productErp = await prisma.product.create({
    data: {
      name: 'Brightloop Business ERP Suite',
      type: 'SOFTWARE',
      salesPrice: 400.0,
      costPrice: 90.0,
      notes: 'All-in-one operations, ledger, inventory and order orchestration.',
      active: true,
    },
  });

  // Odoo variant adds 560 to price (as specified in prompt scene)
  const variantStandard = await prisma.productVariant.create({
    data: {
      productId: productErp.id,
      name: 'Standard Edition',
      priceExtra: 0.0,
      active: true,
    },
  });

  const variantOdoo = await prisma.productVariant.create({
    data: {
      productId: productErp.id,
      name: 'Odoo Brand Edition',
      priceExtra: 560.0,
      active: true,
    },
  });

  const variantEnterpriseCloud = await prisma.productVariant.create({
    data: {
      productId: productErp.id,
      name: 'Enterprise Cloud High-Availability',
      priceExtra: 250.0,
      active: true,
    },
  });

  const productAnalytics = await prisma.product.create({
    data: {
      name: 'Forecasting & BI Add-on',
      type: 'ADDON',
      salesPrice: 150.0,
      costPrice: 25.0,
      notes: 'Predictive churn and revenue forecasting module.',
      active: true,
    },
  });

  const productWarehouse = await prisma.product.create({
    data: {
      name: 'Multi-Warehouse & Dispatch Connector',
      type: 'MODULE',
      salesPrice: 220.0,
      costPrice: 40.0,
      notes: 'Real-time multi-depot sync with automated courier routing.',
      active: true,
    },
  });

  const productSla = await prisma.product.create({
    data: {
      name: 'Dedicated 24/7 SLA & Solution Architect',
      type: 'SERVICE',
      salesPrice: 500.0,
      costPrice: 180.0,
      notes: 'Guaranteed 15-minute response time and monthly architecture review.',
      active: true,
    },
  });

  // 4. Plans
  const planStarter = await prisma.plan.create({
    data: {
      name: 'Starter Monthly',
      code: 'PLAN-START-M',
      cost: 99.0,
      billingInterval: 'MONTHLY',
      minQuantity: 1,
      autoCloseOnEnd: false,
      allowEarlyClose: true,
      allowPause: true,
      allowRenewal: true,
      active: true,
    },
  });

  const planGrowth = await prisma.plan.create({
    data: {
      name: 'Growth Monthly',
      code: 'PLAN-GROW-M',
      cost: 299.0,
      billingInterval: 'MONTHLY',
      minQuantity: 5,
      autoCloseOnEnd: false,
      allowEarlyClose: true,
      allowPause: true,
      allowRenewal: true,
      active: true,
    },
  });

  const planEnterprise = await prisma.plan.create({
    data: {
      name: 'Enterprise Annual',
      code: 'PLAN-ENT-Y',
      cost: 2400.0,
      billingInterval: 'YEARLY',
      minQuantity: 10,
      autoCloseOnEnd: false,
      allowEarlyClose: false,
      allowPause: true,
      allowRenewal: true,
      active: true,
    },
  });

  const planWeekly = await prisma.plan.create({
    data: {
      name: 'High-Velocity Weekly',
      code: 'PLAN-VEL-W',
      cost: 75.0,
      billingInterval: 'WEEKLY',
      minQuantity: 1,
      autoCloseOnEnd: false,
      allowEarlyClose: true,
      allowPause: true,
      allowRenewal: true,
      active: true,
    },
  });

  const planPilot = await prisma.plan.create({
    data: {
      name: 'Pilot 14-Day Sprint',
      code: 'PLAN-PILOT-D',
      cost: 15.0,
      billingInterval: 'DAILY',
      minQuantity: 1,
      autoCloseOnEnd: true, // auto closes on end date!
      allowEarlyClose: true,
      allowPause: false,
      allowRenewal: false,
      active: true,
    },
  });

  // 5. Discount Rules
  const discountVolume = await prisma.discountRule.create({
    data: {
      code: 'GROWTH10',
      description: '10% volume discount for teams with 5+ seats',
      discountType: 'PERCENTAGE',
      value: 10.0,
      minQuantity: 5,
      scope: 'ALL_SUBSCRIPTION',
      usageCount: 4,
      active: true,
    },
  });

  const discountEnterprise = await prisma.discountRule.create({
    data: {
      code: 'ENTERPRISE150',
      description: '$150 contract discount for annual enterprise agreements',
      discountType: 'FIXED_AMOUNT',
      value: 150.0,
      minPurchaseAmount: 1000.0,
      scope: 'ALL_SUBSCRIPTION',
      usageCount: 2,
      active: true,
    },
  });

  const discountOdoo = await prisma.discountRule.create({
    data: {
      code: 'ODOOMIGRATE15',
      description: '15% promotional concession on Odoo Brand Suite',
      discountType: 'PERCENTAGE',
      value: 15.0,
      scope: 'SPECIFIC_PRODUCT',
      productId: productErp.id,
      usageCount: 1,
      active: true,
    },
  });

  // 6. Quotation Templates
  const templateEnterprise = await prisma.quotationTemplate.create({
    data: {
      name: 'Enterprise Logistics & ERP Package',
      planId: planEnterprise.id,
      validityDays: 30,
      notes: 'Standard enterprise setup with Odoo brand variant and dedicated SLA.',
      lines: {
        create: [
          {
            productId: productErp.id,
            productVariantId: variantOdoo.id,
            quantity: 10,
            unitPrice: 960.0, // 400 base + 560 variant
          },
          {
            productId: productSla.id,
            quantity: 1,
            unitPrice: 500.0,
          },
          {
            productId: productWarehouse.id,
            quantity: 2,
            unitPrice: 220.0,
          },
        ],
      },
    },
  });

  const templateGrowth = await prisma.quotationTemplate.create({
    data: {
      name: 'Growth Operations Monthly Bundle',
      planId: planGrowth.id,
      validityDays: 14,
      notes: 'Turnkey bundle for scaling businesses: 5 ERP seats + Forecasting BI.',
      lines: {
        create: [
          {
            productId: productErp.id,
            productVariantId: variantStandard.id,
            quantity: 5,
            unitPrice: 400.0,
          },
          {
            productId: productAnalytics.id,
            quantity: 1,
            unitPrice: 150.0,
          },
        ],
      },
    },
  });

  // 7. Subscriptions
  const now = new Date();
  const pastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const dueYesterday = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
  const nextYear = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

  // Active Subscription 1: Alex Lindqvist (Nordic Retail AB) - DUE FOR BILLING TODAY!
  const subNordic = await prisma.subscription.create({
    data: {
      subscriptionNumber: 'SUB-2026-0001',
      customerId: customer1.id,
      planId: planGrowth.id,
      status: 'ACTIVE',
      startDate: pastMonth,
      nextBillingDate: dueYesterday, // Due for billing day run!
      paymentTerms: 'Net 15',
      autoRenew: true,
      discountRuleId: discountVolume.id,
      notes: 'Preferred dispatch and auto-debit invoice enabled.',
      lines: {
        create: [
          {
            productId: productErp.id,
            productVariantId: variantStandard.id,
            quantity: 5,
            unitPrice: 400.0,
            taxRate: 20.0,
          },
          {
            productId: productAnalytics.id,
            quantity: 1,
            unitPrice: 150.0,
            taxRate: 20.0,
          },
        ],
      },
    },
  });

  // Active Subscription 2: Elena Morales (Apex Logistics) - Large Enterprise Contract
  const subApex = await prisma.subscription.create({
    data: {
      subscriptionNumber: 'SUB-2026-0002',
      customerId: customer2.id,
      planId: planEnterprise.id,
      status: 'ACTIVE',
      startDate: pastMonth,
      expiryDate: nextYear,
      nextBillingDate: nextMonth,
      paymentTerms: 'Net 30',
      autoRenew: true,
      discountRuleId: discountEnterprise.id,
      notes: 'Global SLA 24/7 with customized Odoo brand variant connectors.',
      lines: {
        create: [
          {
            productId: productErp.id,
            productVariantId: variantOdoo.id,
            quantity: 12,
            unitPrice: 960.0, // 400 + 560
            taxRate: 8.25,
          },
          {
            productId: productWarehouse.id,
            quantity: 4,
            unitPrice: 220.0,
            taxRate: 8.25,
          },
          {
            productId: productSla.id,
            quantity: 1,
            unitPrice: 500.0,
            taxRate: 8.25,
          },
        ],
      },
    },
  });

  // Active Subscription 3: Studio Kraft - Also DUE FOR BILLING TODAY!
  const subStudio = await prisma.subscription.create({
    data: {
      subscriptionNumber: 'SUB-2026-0003',
      customerId: customer3.id,
      planId: planStarter.id,
      status: 'ACTIVE',
      startDate: pastMonth,
      nextBillingDate: dueYesterday, // Due for billing run!
      paymentTerms: 'Immediate',
      autoRenew: true,
      notes: 'Creative studio monthly subscription.',
      lines: {
        create: [
          {
            productId: productErp.id,
            productVariantId: variantStandard.id,
            quantity: 2,
            unitPrice: 400.0,
            taxRate: 19.0,
          },
        ],
      },
    },
  });

  // Quotation stage subscription for Urban Fleet (Draft/Quote prepared by Sales rep)
  const subQuote = await prisma.subscription.create({
    data: {
      subscriptionNumber: 'SUB-2026-0004',
      customerId: customer4.id,
      planId: planGrowth.id,
      status: 'QUOTATION',
      startDate: now,
      nextBillingDate: now,
      paymentTerms: 'Net 30',
      autoRenew: true,
      notes: 'Quote pending customer sign-off from sales rep Sarah.',
      lines: {
        create: [
          {
            productId: productErp.id,
            productVariantId: variantEnterpriseCloud.id,
            quantity: 6,
            unitPrice: 650.0,
            taxRate: 20.0,
          },
          {
            productId: productWarehouse.id,
            quantity: 2,
            unitPrice: 220.0,
            taxRate: 20.0,
          },
        ],
      },
    },
  });

  // 8. Invoices & Payments
  // Invoice 1: Past Month for Apex Logistics (PAID in full)
  const invApex = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-0001',
      customerId: customer2.id,
      subscriptionId: subApex.id,
      status: 'PAID',
      issueDate: pastMonth,
      dueDate: new Date(pastMonth.getTime() + 30 * 24 * 60 * 60 * 1000),
      subtotal: 12900.0,
      taxTotal: 1064.25,
      discountTotal: 150.0,
      grandTotal: 13814.25,
      amountPaid: 13814.25,
      sentAt: pastMonth,
      notes: 'Annual contract initial charge - Paid via Wire Transfer.',
      lines: {
        create: [
          {
            productId: productErp.id,
            productVariantId: variantOdoo.id,
            description: 'Brightloop Business ERP Suite (Odoo Brand Edition) x 12',
            quantity: 12,
            unitPrice: 960.0,
            taxRate: 8.25,
            taxAmount: 950.4,
            discountAmount: 150.0,
            lineTotal: 11520.0,
          },
          {
            productId: productWarehouse.id,
            description: 'Multi-Warehouse & Dispatch Connector x 4',
            quantity: 4,
            unitPrice: 220.0,
            taxRate: 8.25,
            taxAmount: 72.6,
            discountAmount: 0.0,
            lineTotal: 880.0,
          },
          {
            productId: productSla.id,
            description: 'Dedicated 24/7 SLA & Solution Architect',
            quantity: 1,
            unitPrice: 500.0,
            taxRate: 8.25,
            taxAmount: 41.25,
            discountAmount: 0.0,
            lineTotal: 500.0,
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      invoiceId: invApex.id,
      amount: 13814.25,
      paymentDate: new Date(pastMonth.getTime() + 3 * 24 * 60 * 60 * 1000),
      method: 'BANK_TRANSFER',
      transactionReference: 'WIRE-APEX-890124',
      notes: 'Full payment received through JPMorgan Chase Wire.',
      recordedById: admin.id,
    },
  });

  // Invoice 2: Past Month for Nordic Retail (PAID in full)
  const invNordic = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-0002',
      customerId: customer1.id,
      subscriptionId: subNordic.id,
      status: 'PAID',
      issueDate: pastMonth,
      dueDate: new Date(pastMonth.getTime() + 15 * 24 * 60 * 60 * 1000),
      subtotal: 2150.0,
      taxTotal: 387.0,
      discountTotal: 215.0, // 10% volume discount
      grandTotal: 2322.0,
      amountPaid: 2322.0,
      sentAt: pastMonth,
      notes: 'Monthly billing for Nordic Retail AB.',
      lines: {
        create: [
          {
            productId: productErp.id,
            productVariantId: variantStandard.id,
            description: 'Brightloop Business ERP Suite (Standard Edition) x 5',
            quantity: 5,
            unitPrice: 400.0,
            taxRate: 20.0,
            taxAmount: 360.0,
            discountAmount: 200.0,
            lineTotal: 2000.0,
          },
          {
            productId: productAnalytics.id,
            description: 'Forecasting & BI Add-on',
            quantity: 1,
            unitPrice: 150.0,
            taxRate: 20.0,
            taxAmount: 27.0,
            discountAmount: 15.0,
            lineTotal: 150.0,
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      invoiceId: invNordic.id,
      amount: 2322.0,
      paymentDate: new Date(pastMonth.getTime() + 2 * 24 * 60 * 60 * 1000),
      method: 'CREDIT_CARD',
      transactionReference: 'STRIPE-CH-918231',
      notes: 'Automatic Stripe recurring charge cleared.',
      recordedById: staff1.id,
    },
  });

  // Invoice 3: An OVERDUE invoice for Chloe Dupont (Urban Fleet) for setup / consulting
  const overdueDate = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
  const invOverdue = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-0003',
      customerId: customer4.id,
      status: 'CONFIRMED', // Confirmed but UNPAID and PAST DUE!
      issueDate: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
      dueDate: overdueDate,
      subtotal: 1200.0,
      taxTotal: 240.0,
      discountTotal: 0.0,
      grandTotal: 1440.0,
      amountPaid: 0.0,
      sentAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
      notes: 'Architecture assessment & fleet API provisioning - Overdue 10 days.',
      lines: {
        create: [
          {
            productId: productSla.id,
            description: 'Technical Deployment Consulting & Fleet Integration (2 sessions)',
            quantity: 2,
            unitPrice: 600.0,
            taxRate: 20.0,
            taxAmount: 240.0,
            discountAmount: 0.0,
            lineTotal: 1200.0,
          },
        ],
      },
    },
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

