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

test("small order: shipping 6, tax on subtotal only", () => {
  const cart = addItem(createCart(), mug);
  assert.deepEqual(totals(cart), { subtotal: 16, shipping: 6, tax: 1.28, total: 23.28 });
});

test("empty cart has no shipping", () => {
  assert.deepEqual(totals(createCart()), { subtotal: 0, shipping: 0, tax: 0, total: 0 });
  assert.equal(shipping(createCart()), 0);
});

test("shipping boundaries at $74.99 and $75.00", () => {
  const under = addItem(createCart(), { id: "a", name: "A", price: 74.99 });
  const at = addItem(createCart(), { id: "b", name: "B", price: 75 });
  assert.equal(shipping(under), SHIPPING_FEE);
  assert.equal(shipping(at), 0);
  assert.equal(totals(at).total, 81);
});

test("order above threshold ships free", () => {
  const cart = addItem(addItem(createCart(), tee, 3), mug);
  assert.deepEqual(totals(cart), { subtotal: 100, shipping: 0, tax: 8, total: 108 });
});

test("free shipping progress", () => {
  assert.deepEqual(freeShippingProgress(createCart()), { remaining: 75, percent: 0, unlocked: false });
  const half = addItem(createCart(), { id: "h", name: "H", price: 37.5 });
  assert.deepEqual(freeShippingProgress(half), { remaining: 37.5, percent: 50, unlocked: false });
  const over = addItem(createCart(), tee, 3);
  assert.deepEqual(freeShippingProgress(over), { remaining: 0, percent: 100, unlocked: true });
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
