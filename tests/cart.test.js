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

const cartOf = (extra = 0) => {
  let c = addItem(addItem(createCart(), tee, 2), mug);
  if (extra) c = addItem(c, { id: "sticker", name: "Sticker", price: extra });
  return c;
};

test("empty cart has no shipping and zero totals", () => {
  assert.equal(shipping(createCart()), 0);
  assert.deepEqual(totals(createCart()), { subtotal: 0, shipping: 0, tax: 0, total: 0 });
});

test("shipping is charged under, free at and over the threshold", () => {
  assert.equal(shipping(cartOf()), SHIPPING_FEE);
  assert.equal(subtotal(cartOf(3)), FREE_SHIPPING_THRESHOLD);
  assert.equal(shipping(cartOf(3)), 0);
  assert.equal(shipping(cartOf(10)), 0);
});

test("shipping is not taxed", () => {
  const t = totals(cartOf());
  assert.equal(t.tax, 5.76);
  assert.equal(t.total, 83.76);
});

test("freeShippingProgress reports remaining, unlocked and capped percent", () => {
  assert.deepEqual(freeShippingProgress(createCart()), { remaining: 75, unlocked: false, percent: 0 });
  assert.deepEqual(freeShippingProgress(cartOf()), { remaining: 3, unlocked: false, percent: 96 });
  assert.deepEqual(freeShippingProgress(cartOf(3)), { remaining: 0, unlocked: true, percent: 100 });
  assert.deepEqual(freeShippingProgress(cartOf(50)), { remaining: 0, unlocked: true, percent: 100 });
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
