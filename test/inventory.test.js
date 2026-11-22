const assert = require('node:assert/strict');
const test = require('node:test');
const inventory = require('../lib/inventory');

test('sellable stock excludes reserved units and has a floor of zero', () => {
  assert.equal(inventory.getSellableStock({ stock: 7, reserved: 2 }), 5);
  assert.equal(inventory.getSellableStock({ stock: 1, reserved: 2 }), 0);
});

test('checkout accepts the exact sellable quantity and rejects more', () => {
  const products = [{ id: 1, name: 'Rice', stock: 7, reserved: 2 }];

  assert.equal(inventory.check(products, [{ id: 1, qty: 4 }]).ok, true);
  assert.equal(inventory.check(products, [{ id: 1, qty: 5 }]).ok, true);
  assert.equal(inventory.check(products, [{ id: 1, qty: 6 }]).ok, false);
  assert.equal(inventory.check(products, [{ id: 1, qty: 3 }, { id: 1, qty: 3 }]).ok, false);
});

test('releasing a checkout line restores physical stock and preserves reservations', () => {
  const products = [{ id: 1, stock: 7, reserved: 2 }];
  const checkoutLines = [{ id: 1, qty: 3 }];

  inventory.reserve(products, checkoutLines);
  assert.equal(products[0].stock, 4);

  inventory.release(products, checkoutLines);
  assert.equal(products[0].stock, 7);
  assert.equal(products[0].reserved, 2);
});

test('releasing a line with productId reduces the reservation without changing stock', () => {
  const products = [{ id: 1, stock: 7, reserved: 2 }];

  inventory.release(products, [{ productId: 1, qty: 1 }]);

  assert.equal(products[0].reserved, 1);
  assert.equal(products[0].stock, 7);
});
