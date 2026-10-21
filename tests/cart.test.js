import { test } from "node:test";
import assert from "node:assert/strict";
import { addItem, createCart, formatMoney, freeShippingProgress, itemCount, removeItem, roundCents, shippingFor, subtotal, totals } from "../src/cart.js";

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

test("totals add shipping and 8% tax rounded to cents", () => {
  const cart = addItem(createCart(), mug);
  assert.deepEqual(totals(cart), { subtotal: 16, shipping: 6, tax: 1.28, total: 23.28 });
});

test("empty cart has no shipping", () => {
  assert.deepEqual(totals(createCart()), { subtotal: 0, shipping: 0, tax: 0, total: 0 });
});

test("$74.99 still pays shipping", () => {
  const cart = addItem(createCart(), { id: "x", name: "X", price: 74.99 });
  assert.equal(totals(cart).shipping, 6);
});

test("exactly $75 ships free", () => {
  const cart = addItem(createCart(), { id: "x", name: "X", price: 75 });
  assert.deepEqual(totals(cart), { subtotal: 75, shipping: 0, tax: 6, total: 81 });
});

test("over $75 ships free", () => {
  const cart = addItem(createCart(), tee, 3);
  assert.equal(totals(cart).shipping, 0);
});

test("shipping is not taxed", () => {
  const t = totals(addItem(createCart(), mug));
  assert.equal(t.tax, roundCents(t.subtotal * 0.08));
  assert.equal(shippingFor(0), 0);
  assert.equal(shippingFor(10), 6);
});

test("freeShippingProgress reports remaining, progress and unlocked", () => {
  assert.deepEqual(freeShippingProgress(createCart()), { remaining: 75, progress: 0, unlocked: false });
  assert.deepEqual(freeShippingProgress(addItem(createCart(), { id: "x", name: "X", price: 37.5 })), {
    remaining: 37.5,
    progress: 0.5,
    unlocked: false,
  });
  assert.deepEqual(freeShippingProgress(addItem(createCart(), tee, 3)), { remaining: 0, progress: 1, unlocked: true });
  assert.equal(freeShippingProgress(addItem(createCart(), { id: "x", name: "X", price: 75 })).unlocked, true);
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
