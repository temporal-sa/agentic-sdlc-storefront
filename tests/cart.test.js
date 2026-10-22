import { test } from "node:test";
import assert from "node:assert/strict";
import {
  addItem,
  amountToFreeShipping,
  createCart,
  formatMoney,
  itemCount,
  removeItem,
  shipping,
  subtotal,
  totals,
} from "../src/cart.js";

const priced = (price, qty = 1) => addItem(createCart(), { id: "x", name: "X", price }, qty);

test("empty cart has no shipping", () => {
  const cart = createCart();
  assert.equal(shipping(cart), 0);
  assert.deepEqual(totals(cart), { subtotal: 0, shipping: 0, tax: 0, total: 0 });
  assert.equal(amountToFreeShipping(cart), 75);
});

test("$74.99 pays shipping, tax only on subtotal", () => {
  const cart = priced(74.99);
  assert.deepEqual(totals(cart), { subtotal: 74.99, shipping: 6, tax: 6, total: 86.99 });
  assert.equal(amountToFreeShipping(cart), 0.01);
});

test("exactly $75 ships free", () => {
  const cart = priced(75);
  assert.deepEqual(totals(cart), { subtotal: 75, shipping: 0, tax: 6, total: 81 });
  assert.equal(amountToFreeShipping(cart), 0);
});

test("over $75 ships free", () => {
  const cart = priced(100);
  assert.deepEqual(totals(cart), { subtotal: 100, shipping: 0, tax: 8, total: 108 });
  assert.equal(amountToFreeShipping(cart), 0);
});

test("floating point rounding with $24.99 items", () => {
  const three = priced(24.99, 3);
  assert.equal(subtotal(three), 74.97);
  assert.equal(shipping(three), 6);
  assert.equal(amountToFreeShipping(three), 0.03);
  assert.deepEqual(totals(three), { subtotal: 74.97, shipping: 6, tax: 6, total: 86.97 });
  const four = priced(24.99, 4);
  assert.deepEqual(totals(four), { subtotal: 99.96, shipping: 0, tax: 8, total: 107.96 });
});

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
