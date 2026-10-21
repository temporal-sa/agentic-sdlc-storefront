import { test } from "node:test";
import assert from "node:assert/strict";
import { addItem, createCart, formatMoney, itemCount, removeItem, subtotal, totals } from "../src/cart.js";

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

test("totals add 8% tax rounded to cents, plus shipping", () => {
  const cart = addItem(createCart(), mug);
  assert.deepEqual(totals(cart), { subtotal: 16, shipping: 6, tax: 1.28, total: 23.28 });
});

test("empty cart has no shipping and full remaining", () => {
  const cart = createCart();
  assert.equal(shipping(cart), 0);
  assert.deepEqual(freeShippingProgress(cart), { remaining: 75, unlocked: false, percent: 0 });
  assert.deepEqual(totals(cart), { subtotal: 0, shipping: 0, tax: 0, total: 0 });
});

test("under $75 pays shipping and shows remaining", () => {
  const cart = addItem(addItem(createCart(), tee, 2), mug); // 72
  assert.equal(shipping(cart), 6);
  const p = freeShippingProgress(cart);
  assert.equal(p.remaining, 3);
  assert.equal(p.unlocked, false);
  assert.ok(p.percent < 100);
});

test("exactly $75 ships free", () => {
  const cart = addItem(createCart(), { id: "x", name: "X", price: 75 });
  assert.equal(shipping(cart), 0);
  assert.deepEqual(freeShippingProgress(cart), { remaining: 0, unlocked: true, percent: 100 });
});

test("over $75 ships free and percent is capped", () => {
  const cart = addItem(createCart(), { id: "x", name: "X", price: 150 });
  assert.equal(shipping(cart), 0);
  assert.equal(freeShippingProgress(cart).percent, 100);
});

test("tax excludes shipping and total includes it", () => {
  const cart = addItem(createCart(), tee); // 28
  const t = totals(cart);
  assert.equal(t.tax, 2.24);
  assert.equal(t.shipping, 6);
  assert.equal(t.total, 36.24);
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
