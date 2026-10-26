import { test } from "node:test";
import assert from "node:assert/strict";
import {
  addItem, createCart, formatMoney, itemCount, removeItem, subtotal, totals,
  saveForLater, moveToCart, savedCount,
} from "../src/cart.js";

test("saveForLater moves item to saved", () => {
  const cart = saveForLater(addItem(addItem(createCart(), tee, 2), mug), "tee");
  assert.deepEqual(cart.items.map((i) => i.id), ["mug"]);
  assert.deepEqual(cart.saved.map((i) => [i.id, i.quantity]), [["tee", 2]]);
});

test("moveToCart moves item back", () => {
  const cart = moveToCart(saveForLater(addItem(createCart(), tee), "tee"), "tee");
  assert.equal(cart.items.length, 1);
  assert.equal(cart.saved.length, 0);
});

test("moving merges quantities", () => {
  let cart = saveForLater(addItem(createCart(), tee, 2), "tee");
  cart = saveForLater(addItem(cart, tee, 3), "tee");
  assert.equal(cart.saved.length, 1);
  assert.equal(savedCount(cart), 5);
  cart = addItem(cart, tee, 1);
  cart = moveToCart(cart, "tee");
  assert.equal(cart.items[0].quantity, 6);
  assert.equal(cart.saved.length, 0);
});

test("unknown ids leave the cart unchanged", () => {
  const cart = addItem(createCart(), tee);
  assert.equal(saveForLater(cart, "nope"), cart);
  assert.equal(moveToCart(cart, "nope"), cart);
});

test("moves do not mutate the input cart", () => {
  const cart = addItem(createCart(), tee);
  const snapshot = JSON.stringify(cart);
  saveForLater(cart, "tee");
  assert.equal(JSON.stringify(cart), snapshot);
});

test("savedCount handles legacy carts without saved", () => {
  assert.equal(savedCount({ items: [] }), 0);
  const moved = saveForLater({ items: [{ id: "tee", name: "Tee", price: 28, quantity: 1 }] }, "tee");
  assert.equal(savedCount(moved), 1);
});

test("totals and itemCount ignore saved items; add/remove keep saved", () => {
  let cart = saveForLater(addItem(createCart(), tee, 2), "tee");
  cart = addItem(cart, mug);
  assert.equal(itemCount(cart), 1);
  assert.deepEqual(totals(cart), { subtotal: 16, tax: 1.28, total: 17.28 });
  cart = removeItem(cart, "mug");
  assert.equal(savedCount(cart), 2);
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
  assert.deepEqual(totals(cart), { subtotal: 16, tax: 1.28, total: 17.28 });
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
