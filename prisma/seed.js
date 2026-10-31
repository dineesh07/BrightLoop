const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Brightloop database in Indian Rupee (₹ INR)...');

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
      currency: 'INR',
    },
  });

  const userDineesh = await prisma.user.create({
    data: {
      email: 'dineeshkalai07@gmail.com',
      name: 'Dineesh',
      passwordHash: adminPass,
      role: 'ADMIN',
      companyName: 'Brightloop Admin',
      currency: 'INR',
    },
  });

  const staff1 = await prisma.user.create({
    data: {
      email: 'sarah.sales@brightloop.com',
      name: 'Sarah Jenkins',
      passwordHash: staffPass,
      role: 'STAFF',
      companyName: 'Brightloop Sales Team',
      currency: 'INR',
    },
  });

  const staff2 = await prisma.user.create({
    data: {
      email: 'marcus.ops@brightloop.com',
      name: 'Marcus Vance',
      passwordHash: staffPass,
      role: 'STAFF',
      companyName: 'Brightloop Customer Operations',
      currency: 'INR',
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      email: 'alex@nordicretail.com',
      name: 'Alex Lindqvist',
      passwordHash: customerPass,
      role: 'CUSTOMER',
      companyName: 'Nordic Retail AB',
      phone: '+91 98765 43210',
      address: 'MG Road, Indiranagar',
      city: 'Bengaluru',
      country: 'India',
      vatNumber: '29AABCB1234C1Z5',
      currency: 'INR',
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: 'elena@apexlogistics.io',
      name: 'Elena Morales',
      passwordHash: customerPass,
      role: 'CUSTOMER',
      companyName: 'Apex Logistics Global Inc.',
      phone: '+91 98111 22334',
      address: 'Bandra-Kurla Complex, Tower 2',
      city: 'Mumbai',
      country: 'India',
      vatNumber: '27AABCA5678D1Z2',
      currency: 'INR',
    },
  });

  const customer3 = await prisma.user.create({
    data: {
      email: 'liam@studiokraft.de',
      name: 'Liam Weber',
      passwordHash: customerPass,
      role: 'CUSTOMER',
      companyName: 'Studio Kraft Technologies',
      phone: '+91 97222 33445',
      address: 'Cyber City, Phase 3',
      city: 'Gurugram',
      country: 'India',
      vatNumber: '06AABCX9988E1Z9',
      currency: 'INR',
    },
  });

  const customer4 = await prisma.user.create({
    data: {
      email: 'chloe@urbanfleet.co',
      name: 'Chloe Dupont',
      passwordHash: customerPass,
      role: 'CUSTOMER',
      companyName: 'Urban Fleet Logistics',
      phone: '+91 96333 44556',
      address: 'HITEC City, Madhapur',
      city: 'Hyderabad',
      country: 'India',
      vatNumber: '36AABCY1122F1Z8',
      currency: 'INR',
    },
  });

  console.log('Created users in INR.');

  // 2. Tax Rules (Indian GST Standards)
  const gst18 = await prisma.taxRule.create({
    data: {
      name: 'Standard GST 18%',
      rate: 18.0,
      country: 'IN',
      isDefault: true,
      active: true,
    },
  });

  const gst5 = await prisma.taxRule.create({
    data: {
      name: 'Reduced GST 5%',
      rate: 5.0,
      country: 'IN',
      isDefault: false,
      active: true,
    },
  });

  const zeroTax = await prisma.taxRule.create({
    data: {
      name: 'GST Exempt 0%',
      rate: 0.0,
      country: 'IN',
      isDefault: false,
      active: true,
    },
  });

  // 3. Products & Variants (with Odoo Brand adding 560 as specified in prompt)
  const productErp = await prisma.product.create({
    data: {
      name: 'Brightloop Business ERP Suite',
      type: 'SOFTWARE',
      salesPrice: 4000.0,
      costPrice: 800.0,
      notes: 'All-in-one operations, ledger, inventory and order orchestration.',
      active: true,
    },
  });

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
      priceExtra: 560.0, // choosing Odoo adds 560 to price!
      active: true,
    },
  });

  const variantEnterpriseCloud = await prisma.productVariant.create({
    data: {
      productId: productErp.id,
      name: 'Enterprise Cloud High-Availability',
      priceExtra: 2500.0,
      active: true,
    },
  });

  const productAnalytics = await prisma.product.create({
    data: {
      name: 'Forecasting & BI Add-on',
      type: 'ADDON',
      salesPrice: 1500.0,
      costPrice: 250.0,
      notes: 'Predictive churn and recurring revenue forecasting module.',
      active: true,
    },
  });

  const productWarehouse = await prisma.product.create({
    data: {
      name: 'Multi-Warehouse & Dispatch Connector',
      type: 'MODULE',
      salesPrice: 2200.0,
      costPrice: 400.0,
      notes: 'Real-time multi-depot sync with automated courier routing.',
      active: true,
    },
  });

  const productSla = await prisma.product.create({
    data: {
      name: 'Dedicated 24/7 SLA & Solution Architect',
      type: 'SERVICE',
      salesPrice: 5000.0,
      costPrice: 1800.0,
      notes: 'Guaranteed 15-minute response time and monthly architecture review.',
      active: true,
    },
  });

  // 4. Plans
  const planStarter = await prisma.plan.create({
    data: {
      name: 'Starter Monthly',
      code: 'PLAN-START-M',
      cost: 999.0,
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
      cost: 2999.0,
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
      cost: 24000.0,
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
      cost: 750.0,
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
      cost: 150.0,
      billingInterval: 'DAILY',
      minQuantity: 1,
      autoCloseOnEnd: true,
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

  const discountFixed = await prisma.discountRule.create({
    data: {
      code: 'ENTERPRISE1500',
      description: '₹1,500 fixed credit on large subscription spend',
      discountType: 'FIXED_AMOUNT',
      value: 1500.0,
      minPurchaseAmount: 10000.0,
      maxUsageLimit: 50,
      usageCount: 12,
      scope: 'ALL_SUBSCRIPTION',
      active: true,
    },
  });

  const discountOdoo = await prisma.discountRule.create({
    data: {
      code: 'ODOOPROMO',
      description: '15% concession for Odoo Brand ERP migrations',
      discountType: 'PERCENTAGE',
      value: 15.0,
      productId: productErp.id,
      scope: 'SPECIFIC_PRODUCT',
      usageCount: 3,
      active: true,
    },
  });

  // 6. Quotation Templates
  const templateEnterprise = await prisma.quotationTemplate.create({
    data: {
      name: 'Enterprise Logistics & Cloud ERP Bundle',
      planId: planEnterprise.id,
      validityDays: 30,
      notes: 'Standard pre-packaged offer for mid-market supply chain operators.',
      active: true,
      lines: {
        create: [
          {
            productId: productErp.id,
            productVariantId: variantEnterpriseCloud.id,
            quantity: 12,
            unitPrice: 6500.0,
          },
          {
            productId: productWarehouse.id,
            quantity: 4,
            unitPrice: 2200.0,
          },
          {
            productId: productSla.id,
            quantity: 1,
            unitPrice: 5000.0,
          },
        ],
      },
    },
  });

  const templateGrowth = await prisma.quotationTemplate.create({
    data: {
      name: 'Growth Operations & Analytics Package',
      planId: planGrowth.id,
      validityDays: 14,
      notes: 'High-conversion template for fast-scaling multi-channel retailers.',
      active: true,
      lines: {
        create: [
          {
            productId: productErp.id,
            productVariantId: variantOdoo.id,
            quantity: 5,
            unitPrice: 4560.0, // 4000 base + 560 Odoo
          },
          {
            productId: productAnalytics.id,
            quantity: 1,
            unitPrice: 1500.0,
          },
        ],
      },
    },
  });

  // 7. Subscriptions
  const now = new Date();
  const pastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Sub 1: Apex Logistics
  const subApex = await prisma.subscription.create({
    data: {
      subscriptionNumber: 'SUB-2026-0001',
      customerId: customer2.id,
      planId: planEnterprise.id,
      status: 'ACTIVE',
      startDate: pastMonth,
      expiryDate: new Date(now.getTime() + 335 * 24 * 60 * 60 * 1000),
      paymentTerms: 'Net 30',
      nextBillingDate: new Date(now.getTime() + 335 * 24 * 60 * 60 * 1000),
      autoRenew: true,
      discountRuleId: discountFixed.id,
      lines: {
        create: [
          {
            productId: productErp.id,
            productVariantId: variantOdoo.id,
            quantity: 12,
            unitPrice: 4560.0, // 4000 base + 560 Odoo
            taxRate: 18.0,
          },
          {
            productId: productWarehouse.id,
            quantity: 4,
            unitPrice: 2200.0,
            taxRate: 18.0,
          },
          {
            productId: productSla.id,
            quantity: 1,
            unitPrice: 5000.0,
            taxRate: 18.0,
          },
        ],
      },
    },
  });

  // Sub 2: Nordic Retail
  const subNordic = await prisma.subscription.create({
    data: {
      subscriptionNumber: 'SUB-2026-0002',
      customerId: customer1.id,
      planId: planGrowth.id,
      status: 'ACTIVE',
      startDate: pastMonth,
      nextBillingDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      paymentTerms: 'Net 15',
      autoRenew: true,
      discountRuleId: discountVolume.id,
      lines: {
        create: [
          {
            productId: productErp.id,
            productVariantId: variantStandard.id,
            quantity: 5,
            unitPrice: 4000.0,
            taxRate: 18.0,
          },
          {
            productId: productAnalytics.id,
            quantity: 1,
            unitPrice: 1500.0,
            taxRate: 18.0,
          },
        ],
      },
    },
  });

  // Sub 3: Studio Kraft (Quotation stage)
  const subDraft = await prisma.subscription.create({
    data: {
      subscriptionNumber: 'SUB-2026-0003',
      customerId: customer3.id,
      planId: planGrowth.id,
      status: 'QUOTATION',
      startDate: now,
      nextBillingDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      paymentTerms: 'Immediate',
      autoRenew: true,
      lines: {
        create: [
          {
            productId: productErp.id,
            productVariantId: variantEnterpriseCloud.id,
            quantity: 6,
            unitPrice: 6500.0,
            taxRate: 18.0,
          },
        ],
      },
    },
  });

  // Sub 4: Urban Fleet (Due for billing today!)
  const subUrban = await prisma.subscription.create({
    data: {
      subscriptionNumber: 'SUB-2026-0004',
      customerId: customer4.id,
      planId: planStarter.id,
      status: 'ACTIVE',
      startDate: pastMonth,
      nextBillingDate: new Date(now.getTime() - 1 * 60 * 60 * 1000), // Due today!
      paymentTerms: 'Immediate',
      autoRenew: true,
      lines: {
        create: [
          {
            productId: productErp.id,
            productVariantId: variantStandard.id,
            quantity: 2,
            unitPrice: 4000.0,
            taxRate: 18.0,
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
      subtotal: 68520.0,
      taxTotal: 12063.6,
      discountTotal: 1500.0,
      grandTotal: 79083.6,
      amountPaid: 79083.6,
      sentAt: pastMonth,
      notes: 'Annual contract initial charge - Paid via NEFT/RTGS.',
      lines: {
        create: [
          {
            productId: productErp.id,
            productVariantId: variantOdoo.id,
            description: 'Brightloop Business ERP Suite (Odoo Brand Edition) x 12',
            quantity: 12,
            unitPrice: 4560.0,
            taxRate: 18.0,
            taxAmount: 9849.6,
            discountAmount: 1500.0,
            lineTotal: 54720.0,
          },
          {
            productId: productWarehouse.id,
            description: 'Multi-Warehouse & Dispatch Connector x 4',
            quantity: 4,
            unitPrice: 2200.0,
            taxRate: 18.0,
            taxAmount: 1584.0,
            discountAmount: 0.0,
            lineTotal: 8800.0,
          },
          {
            productId: productSla.id,
            description: 'Dedicated 24/7 SLA & Solution Architect',
            quantity: 1,
            unitPrice: 5000.0,
            taxRate: 18.0,
            taxAmount: 630.0,
            discountAmount: 0.0,
            lineTotal: 5000.0,
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      invoiceId: invApex.id,
      amount: 79083.6,
      paymentDate: new Date(pastMonth.getTime() + 3 * 24 * 60 * 60 * 1000),
      method: 'BANK_TRANSFER',
      transactionReference: 'NEFT-HDFC-890124',
      notes: 'Full payment received through HDFC Bank RTGS.',
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
      subtotal: 21500.0,
      taxTotal: 3483.0,
      discountTotal: 2150.0, // 10% volume discount
      grandTotal: 22833.0,
      amountPaid: 22833.0,
      sentAt: pastMonth,
      notes: 'Monthly billing for Nordic Retail AB.',
      lines: {
        create: [
          {
            productId: productErp.id,
            productVariantId: variantStandard.id,
            description: 'Brightloop Business ERP Suite (Standard Edition) x 5',
            quantity: 5,
            unitPrice: 4000.0,
            taxRate: 18.0,
            taxAmount: 3240.0,
            discountAmount: 2000.0,
            lineTotal: 20000.0,
          },
          {
            productId: productAnalytics.id,
            description: 'Forecasting & BI Add-on',
            quantity: 1,
            unitPrice: 1500.0,
            taxRate: 18.0,
            taxAmount: 243.0,
            discountAmount: 150.0,
            lineTotal: 1500.0,
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      invoiceId: invNordic.id,
      amount: 22833.0,
      paymentDate: new Date(pastMonth.getTime() + 2 * 24 * 60 * 60 * 1000),
      method: 'CREDIT_CARD',
      transactionReference: 'UPI-RAZOR-918231',
      notes: 'Automatic Razorpay recurring mandate cleared.',
      recordedById: staff1.id,
    },
  });

  // Invoice 3: An OVERDUE invoice for Chloe Dupont (Urban Fleet)
  const overdueDate = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
  const invOverdue = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-0003',
      customerId: customer4.id,
      status: 'CONFIRMED',
      issueDate: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
      dueDate: overdueDate,
      subtotal: 12000.0,
      taxTotal: 2160.0,
      discountTotal: 0.0,
      grandTotal: 14160.0,
      amountPaid: 0.0,
      sentAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
      notes: 'Architecture assessment & fleet API provisioning - Overdue 10 days.',
      lines: {
        create: [
          {
            productId: productSla.id,
            description: 'Technical Deployment Consulting & Fleet Integration (2 sessions)',
            quantity: 2,
            unitPrice: 6000.0,
            taxRate: 18.0,
            taxAmount: 2160.0,
            discountAmount: 0.0,
            lineTotal: 12000.0,
          },
        ],
      },
    },
  });

  console.log('Seed completed successfully in INR!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
