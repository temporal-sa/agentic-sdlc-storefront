import { test } from "node:test";
import assert from "node:assert/strict";
import {
  addItem,
  createCart,
  formatMoney,
  freeShippingProgress,
  itemCount,
  removeItem,
  shippingCost,
  subtotal,
  totals,
} from "../src/cart.js";

const cartOf = (price, quantity = 1) => addItem(createCart(), { id: "x", name: "X", price }, quantity);

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

test("empty cart has no shipping charge", () => {
  assert.equal(shippingCost(createCart()), 0);
  assert.deepEqual(totals(createCart()), { subtotal: 0, shipping: 0, tax: 0, total: 0 });
});

test("shipping is $6 just under $75", () => {
  assert.equal(shippingCost(cartOf(74.99)), 6);
});

test("shipping is free at exactly $75 and above", () => {
  assert.equal(shippingCost(cartOf(75)), 0);
  assert.equal(shippingCost(cartOf(100)), 0);
});

test("tax excludes shipping", () => {
  assert.deepEqual(totals(cartOf(50)), { subtotal: 50, shipping: 6, tax: 4, total: 60 });
  assert.deepEqual(totals(cartOf(100)), { subtotal: 100, shipping: 0, tax: 8, total: 108 });
});

test("free shipping progress reports remaining, percent and unlocked", () => {
  assert.deepEqual(freeShippingProgress(createCart()), { remaining: 75, unlocked: false, percent: 0 });
  assert.deepEqual(freeShippingProgress(cartOf(30)), { remaining: 45, unlocked: false, percent: 40 });
  assert.deepEqual(freeShippingProgress(cartOf(74.99)), { remaining: 0.01, unlocked: false, percent: 99 });
  assert.deepEqual(freeShippingProgress(cartOf(75)), { remaining: 0, unlocked: true, percent: 100 });
  assert.deepEqual(freeShippingProgress(cartOf(120)), { remaining: 0, unlocked: true, percent: 100 });
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
