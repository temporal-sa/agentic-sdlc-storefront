import { test } from "node:test";
import assert from "node:assert/strict";
import { addItem, amountToFreeShipping, createCart, formatMoney, itemCount, removeItem, shipping, subtotal, totals } from "../src/cart.js";

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

const item = (price) => ({ id: "x" + price, name: "X", price });

test("empty cart has no shipping and 75 to go", () => {
  const cart = createCart();
  assert.equal(shipping(cart), 0);
  assert.equal(amountToFreeShipping(cart), 75);
  assert.equal(totals(cart).total, 0);
});

test("shipping is $6 under the threshold", () => {
  assert.equal(shipping(addItem(createCart(), item(74.99))), 6);
});

test("shipping is free at exactly 75", () => {
  const cart = addItem(createCart(), item(75));
  assert.equal(shipping(cart), 0);
  assert.equal(amountToFreeShipping(cart), 0);
});

test("shipping is free over 75", () => {
  const cart = addItem(createCart(), item(100));
  assert.equal(shipping(cart), 0);
  assert.deepEqual(totals(cart), { subtotal: 100, shipping: 0, tax: 8, total: 108 });
  assert.equal(amountToFreeShipping(cart), 0);
});

test("tax excludes shipping", () => {
  const t = totals(addItem(createCart(), item(50)));
  assert.equal(t.tax, 4);
  assert.equal(t.total, 60);
});

test("amountToFreeShipping reports the remaining amount", () => {
  assert.equal(amountToFreeShipping(addItem(createCart(), item(60))), 15);
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
