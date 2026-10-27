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

test("totals add 8% tax rounded to cents", () => {
  const cart = addItem(createCart(), mug);
  assert.deepEqual(totals(cart), { subtotal: 16, shipping: 6, tax: 1.28, total: 23.28 });
});

test("empty cart has no shipping and zero total", () => {
  assert.deepEqual(totals(createCart()), { subtotal: 0, shipping: 0, tax: 0, total: 0 });
});

test("$74.99 still pays shipping", () => {
  const cart = addItem(createCart(), { id: "x", name: "X", price: 74.99 });
  assert.equal(totals(cart).shipping, 6);
});

test("exactly $75 ships free", () => {
  const cart = addItem(createCart(), { id: "x", name: "X", price: 75 });
  const t = totals(cart);
  assert.equal(t.shipping, 0);
  assert.equal(t.total, 81);
});

test("above $75 ships free", () => {
  const cart = addItem(createCart(), { id: "x", name: "X", price: 100 });
  assert.equal(totals(cart).shipping, 0);
});

test("tax is not applied to shipping", () => {
  const t = totals(addItem(createCart(), mug));
  assert.equal(t.tax, 1.28);
  assert.equal(t.total, 23.28);
});

test("freeShippingRemaining counts down to the threshold", () => {
  assert.equal(freeShippingRemaining(16), 59);
  assert.equal(freeShippingRemaining(74.99), 0.01);
  assert.equal(freeShippingRemaining(75), 0);
  assert.equal(freeShippingRemaining(120), 0);
});

test("shippingFor rules", () => {
  assert.equal(shippingFor(0), 0);
  assert.equal(shippingFor(10), 6);
  assert.equal(shippingFor(75), 0);
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
