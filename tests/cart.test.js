import { test } from "node:test";
import assert from "node:assert/strict";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE, addItem, createCart, formatMoney, freeShippingProgress, itemCount, removeItem, shippingCost, subtotal, totals } from "../src/cart.js";

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

const priced = (price) => addItem(createCart(), { id: "x", name: "X", price });

test("empty cart has no shipping", () => {
  assert.deepEqual(totals(createCart()), { subtotal: 0, shipping: 0, tax: 0, total: 0 });
  assert.equal(shippingCost(0), 0);
});

test("$74.99 pays shipping", () => {
  assert.equal(totals(priced(74.99)).shipping, 6);
});

test("exactly $75 ships free", () => {
  assert.equal(totals(priced(75)).shipping, 0);
});

test("above $75 ships free", () => {
  const t = totals(priced(100));
  assert.deepEqual(t, { subtotal: 100, shipping: 0, tax: 8, total: 108 });
});

test("tax excludes shipping", () => {
  const t = totals(priced(50));
  assert.equal(t.tax, 4);
  assert.equal(t.total, 60);
});

test("freeShippingProgress values", () => {
  assert.equal(FREE_SHIPPING_THRESHOLD, 75);
  assert.equal(SHIPPING_FEE, 6);
  assert.deepEqual(freeShippingProgress(createCart()), { remaining: 75, unlocked: false, percent: 0 });
  assert.deepEqual(freeShippingProgress(priced(60)), { remaining: 15, unlocked: false, percent: 80 });
  assert.deepEqual(freeShippingProgress(priced(75)), { remaining: 0, unlocked: true, percent: 100 });
  assert.deepEqual(freeShippingProgress(priced(120)), { remaining: 0, unlocked: true, percent: 100 });
  assert.equal(freeShippingProgress(priced(74.99)).remaining, 0.01);
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
