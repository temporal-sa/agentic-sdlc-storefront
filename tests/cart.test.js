import { test } from "node:test";
import assert from "node:assert/strict";
import {
  INVALID_CODE_MESSAGE,
  addItem,
  applyDiscountCode,
  createCart,
  formatMoney,
  itemCount,
  removeItem,
  subtotal,
  totals,
} from "../src/cart.js";

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
  assert.deepEqual(totals(cart), { subtotal: 16, discount: 0, tax: 1.28, total: 17.28 });
});

test("discount codes are case-insensitive", () => {
  const result = applyDiscountCode(createCart(), "orbit10");
  assert.equal(result.ok, true);
  assert.equal(result.cart.discountCode, "ORBIT10");
});

test("discount codes allow trimmed spaces", () => {
  const result = applyDiscountCode(createCart(), " Orbit10 ");
  assert.equal(result.ok, true);
  assert.equal(result.cart.discountCode, "ORBIT10");
});

test("invalid discount codes return an error and leave the cart unchanged", () => {
  const cart = addItem(createCart(), mug);
  const result = applyDiscountCode(cart, "MOON20");
  assert.deepEqual(result, { ok: false, cart, error: INVALID_CODE_MESSAGE });
  assert.equal(result.cart, cart);
});

test("empty discount codes are invalid", () => {
  const cart = createCart();
  assert.deepEqual(applyDiscountCode(cart, ""), { ok: false, cart, error: INVALID_CODE_MESSAGE });
});

test("ORBIT10 discounts totals before tax", () => {
  const cart = applyDiscountCode(addItem(createCart(), mug), "ORBIT10").cart;
  assert.deepEqual(totals(cart), { subtotal: 16, discount: 1.6, tax: 1.15, total: 15.55 });
});

test("discount codes stay applied after adding and removing items", () => {
  const discountedCart = applyDiscountCode(addItem(createCart(), mug), "ORBIT10").cart;
  const updatedCart = removeItem(addItem(discountedCart, tee), "mug");
  assert.equal(updatedCart.discountCode, "ORBIT10");
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
