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

test("empty cart has no shipping", () => {
  assert.equal(shipping(createCart()), 0);
  assert.deepEqual(totals(createCart()), { subtotal: 0, shipping: 0, tax: 0, total: 0 });
});

test("shipping is free from a $75 subtotal", () => {
  const under = addItem(addItem(createCart(), tee, 2), mug, 1); // 72
  assert.equal(shipping(under), 6);
  const exact = addItem(createCart(), { id: "x", name: "X", price: 75 });
  assert.equal(shipping(exact), 0);
  assert.deepEqual(totals(exact), { subtotal: 75, shipping: 0, tax: 6, total: 81 });
});

test("freeShippingProgress reports remaining amount and percent", () => {
  assert.deepEqual(freeShippingProgress(createCart()), { threshold: 75, remaining: 75, percent: 0, qualifies: false });
  const cart = addItem(addItem(createCart(), tee, 2), mug);
  assert.deepEqual(freeShippingProgress(cart), { threshold: 75, remaining: 3, percent: 96, qualifies: false });
  const big = addItem(createCart(), tee, 3);
  assert.deepEqual(freeShippingProgress(big), { threshold: 75, remaining: 0, percent: 100, qualifies: true });
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
