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

test("empty cart has no shipping and a zero total", () => {
  assert.equal(shipping(createCart()), 0);
  assert.deepEqual(totals(createCart()), { subtotal: 0, shipping: 0, tax: 0, total: 0 });
});

test("$74.99 is charged shipping", () => {
  const cart = addItem(createCart(), { id: "x", name: "X", price: 74.99 });
  assert.equal(shipping(cart), 6);
  assert.equal(amountToFreeShipping(cart), 0.01);
});

test("exactly $75 ships free", () => {
  const cart = addItem(createCart(), { id: "x", name: "X", price: 75 });
  assert.equal(shipping(cart), 0);
  assert.equal(amountToFreeShipping(cart), 0);
  assert.deepEqual(totals(cart), { subtotal: 75, shipping: 0, tax: 6, total: 81 });
});

test("above $75 ships free", () => {
  const cart = addItem(createCart(), { id: "x", name: "X", price: 100 });
  assert.equal(shipping(cart), 0);
  assert.equal(amountToFreeShipping(cart), 0);
});

test("tax excludes shipping", () => {
  const cart = addItem(createCart(), { id: "x", name: "X", price: 50 });
  const t = totals(cart);
  assert.equal(t.tax, 4);
  assert.equal(t.total, 60);
});

test("amountToFreeShipping is the gap to the threshold", () => {
  assert.equal(amountToFreeShipping(createCart()), 75);
  assert.equal(amountToFreeShipping(addItem(createCart(), mug)), 59);
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
