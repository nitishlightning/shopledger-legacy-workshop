const assert = require('node:assert/strict');
const test = require('node:test');
const orders = require('../lib/orders');
const ledger = require('../lib/ledger');
const invoice = require('../lib/invoice');
const reports = require('../lib/reports');

const history = { orders: [
  { id: 1004, date: '30/01/2022' },
  { id: 1001, date: '28/12/2021' },
  { id: 1008, date: '15/03/2022' },
  { id: 1007, date: '2022-03-04' },
  { id: 1002, date: '05/01/2022' }
] };

test('order history sorts mixed date formats newest first', () => {
  assert.deepEqual(orders.list(history).map(order => order.id), [1008, 1007, 1004, 1002, 1001]);
});

test('date filters include both endpoints and exclude other months and years', () => {
  const filtered = orders.list(history, { from: '2022-01-05', to: '30/01/2022' });
  assert.deepEqual(filtered.map(order => order.id), [1004, 1002]);
});

test('khata settlements add numeric and string amounts as money', () => {
  const db = { customers: [{ id: 1, openingBalance: 450, totalBilled: 1982.01, totalSettled: 1200 }], nextSettlementId: 1 };
  const payment = ledger.recordSettlement(db, 1, '500');
  assert.equal(payment.settlement.amount, 500);
  assert.equal(payment.customer.totalSettled, 1700);
  assert.equal(ledger.listCustomers(db)[0].balance, 732.01);
  assert.equal(ledger.recordSettlement(db, 1, 0.01).customer.balance, 732);
});

test('invalid settlement amounts leave the ledger unchanged', () => {
  const db = { customers: [{ id: 1, totalSettled: 1200 }], nextSettlementId: 1 };
  for (const amount of ['not money', '', -5, Infinity, true, []]) {
    assert.equal(ledger.recordSettlement(db, 1, amount).ok, false);
  }
  assert.equal(db.customers[0].totalSettled, 1200);
  assert.equal(db.nextSettlementId, 1);
  assert.equal(db.settlements, undefined);
});

test('invoice uses checkout GST, coupon limits, and line rounding', () => {
  const examples = [
    { id: 1002, coupon: 'SAVE10', subtotal: 1020, discount: 102, tax: 45.9, total: 963.9,
      items: [{ price: 640, qty: 1, hsn: '1006' }, { price: 190, qty: 2, hsn: '1512' }],
      rates: [5, 5], lineTaxes: [28.8, 17.1] },
    { id: 1004, coupon: 'SAVE10', subtotal: 2240, discount: 150, tax: 104.5, total: 2194.5,
      items: [{ price: 1120, qty: 2, hsn: '1508' }], rates: [5], lineTaxes: [104.5] },
    { id: 1007, subtotal: 1280, discount: 0, tax: 127, total: 1407,
      items: [{ price: 450, qty: 2, hsn: '0405' }, { price: 190, qty: 2, hsn: '1512' }],
      rates: [12, 5], lineTaxes: [108, 19] }
  ];
  for (const order of examples) {
    const figures = invoice.computeInvoiceFigures(order);
    for (const key of ['subtotal', 'discount', 'tax', 'total']) {
      assert.equal(figures[key], order[key], 'Order ' + order.id + ' ' + key);
    }
    assert.deepEqual(figures.rows.map(row => row.gstPercent), order.rates);
    assert.deepEqual(figures.rows.map(row => row.lineTax), order.lineTaxes);
    assert.equal(Math.round((figures.cgst + figures.sgst) * 100), Math.round(order.tax * 100));
    assert.doesNotMatch(invoice.render(order), /Accountant Reconciliation Notice/);
  }
  assert.equal(reports.getGstReconciliation({ orders: examples }).mismatchCount, 0);
});
