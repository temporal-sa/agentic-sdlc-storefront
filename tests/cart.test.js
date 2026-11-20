import { test } from "node:test";
import assert from "node:assert/strict";
import { addItem, createCart, formatMoney, freeShippingProgress, itemCount, removeItem, shippingCost, subtotal, totals } from "../src/cart.js";

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

test("shipping is 0 for an empty cart", () => {
  assert.equal(shippingCost(createCart()), 0);
  assert.deepEqual(totals(createCart()), { subtotal: 0, shipping: 0, tax: 0, total: 0 });
});

test("shipping is $6 under the threshold", () => {
  assert.equal(shippingCost(addItem(createCart(), tee, 2)), 6);
});

test("shipping is free exactly at the threshold", () => {
  const cart = addItem(createCart(), { id: "x", name: "X", price: 75 });
  assert.equal(shippingCost(cart), 0);
});

test("shipping is free over the threshold and tax excludes shipping", () => {
  const cart = addItem(createCart(), tee, 3);
  assert.deepEqual(totals(cart), { subtotal: 84, shipping: 0, tax: 6.72, total: 90.72 });
});

test("tax excludes shipping when shipping applies", () => {
  const t = totals(addItem(createCart(), tee));
  assert.equal(t.tax, 2.24);
  assert.equal(t.total, 36.24);
});

test("free shipping progress values", () => {
  assert.deepEqual(freeShippingProgress(createCart()), { remaining: 75, unlocked: false, percent: 0 });
  const mid = freeShippingProgress(addItem(createCart(), tee, 2));
  assert.equal(mid.remaining, 19);
  assert.equal(mid.unlocked, false);
  assert.ok(Math.abs(mid.percent - 74.6666667) < 0.001);
  const over = freeShippingProgress(addItem(createCart(), tee, 3));
  assert.deepEqual(over, { remaining: 0, unlocked: true, percent: 100 });
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
