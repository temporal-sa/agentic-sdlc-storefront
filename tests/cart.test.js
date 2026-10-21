import { test } from "node:test";
import assert from "node:assert/strict";
import { SHIPPING_FEE, addItem, createCart, formatMoney, freeShippingProgress, itemCount, removeItem, shipping, subtotal, totals } from "../src/cart.js";

const tee = { id: "tee", name: "Tee", price: 28 };
const mug = { id: "mug", name: "Mug", price: 16 };

test("adding the same product twice increases its quantity", () => {
  const cart = addItem(addItem(createCart(), tee), tee);
  assert.equal(cart.items.length, 1);
  assert.equal(itemCount(cart), 2);
});

test("subtotal sums price times quantity", () => {
  const cart = addItem(addItem(createCart(), tee, 2), mug);
  assert.equal(subtotal(cart), 72);
});

test("totals add 8% tax rounded to cents", () => {
  const cart = addItem(createCart(), mug);
  assert.deepEqual(totals(cart), { subtotal: 16, shipping: 6, tax: 1.28, total: 23.28 });
});

const cartOf = (price) => addItem(createCart(), { id: "x", name: "X", price });

test("shipping is charged just under the threshold", () => {
  assert.equal(shipping(cartOf(74.99)), SHIPPING_FEE);
});

test("shipping is free at exactly $75", () => {
  assert.equal(shipping(cartOf(75)), 0);
});

test("shipping is free above $75", () => {
  assert.deepEqual(totals(cartOf(100)), { subtotal: 100, shipping: 0, tax: 8, total: 108 });
});

test("empty cart pays no shipping", () => {
  assert.equal(shipping(createCart()), 0);
  assert.deepEqual(totals(createCart()), { subtotal: 0, shipping: 0, tax: 0, total: 0 });
});

test("tax is not charged on shipping", () => {
  const t = totals(cartOf(50));
  assert.equal(t.tax, 4);
  assert.equal(t.total, 60);
});

test("free shipping progress values", () => {
  assert.deepEqual(freeShippingProgress(createCart()), { remaining: 75, unlocked: false, percent: 0 });
  assert.deepEqual(freeShippingProgress(cartOf(30)), { remaining: 45, unlocked: false, percent: 40 });
  assert.deepEqual(freeShippingProgress(cartOf(75)), { remaining: 0, unlocked: true, percent: 100 });
  assert.deepEqual(freeShippingProgress(cartOf(150)), { remaining: 0, unlocked: true, percent: 100 });
});

test("removing a product drops it from the cart", () => {
  const cart = removeItem(addItem(addItem(createCart(), tee), mug), "tee");
  assert.deepEqual(cart.items.map((i) => i.id), ["mug"]);
});

test("quantity must be positive", () => {
  assert.throws(() => addItem(createCart(), tee, 0));
});

test("money is formatted with two decimals", () => {
  assert.equal(formatMoney(5), "$5.00");
});
