import { test } from "node:test";
import assert from "node:assert/strict";
import { addItem, createCart, formatMoney, freeShippingProgress, itemCount, removeItem, shipping, subtotal, totals } from "../src/cart.js";

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

test("empty cart has zero totals", () => {
  assert.deepEqual(totals(createCart()), { subtotal: 0, shipping: 0, tax: 0, total: 0 });
  assert.equal(shipping(createCart()), 0);
});

test("below threshold pays flat shipping", () => {
  const cart = addItem(addItem(createCart(), tee, 2), mug);
  assert.equal(shipping(cart), 6);
});

test("exactly $75 ships free", () => {
  const cart = addItem(createCart(), { id: "x", name: "X", price: 75 });
  assert.equal(shipping(cart), 0);
});

test("above threshold ships free and tax excludes shipping", () => {
  const cart = addItem(createCart(), { id: "x", name: "X", price: 100 });
  assert.deepEqual(totals(cart), { subtotal: 100, shipping: 0, tax: 8, total: 108 });
  const small = addItem(createCart(), mug);
  assert.equal(totals(small).tax, 1.28);
});

test("freeShippingProgress reports remaining, unlocked, percent", () => {
  const cart = addItem(addItem(createCart(), tee, 2), mug);
  assert.deepEqual(freeShippingProgress(cart), { remaining: 3, unlocked: false, percent: 96 });
  const full = addItem(createCart(), { id: "x", name: "X", price: 75 });
  assert.deepEqual(freeShippingProgress(full), { remaining: 0, unlocked: true, percent: 100 });
  assert.deepEqual(freeShippingProgress(createCart()), { remaining: 75, unlocked: false, percent: 0 });
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
