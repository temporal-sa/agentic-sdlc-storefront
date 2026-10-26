import { test } from "node:test";
import assert from "node:assert/strict";
import {
  addItem,
  createCart,
  formatMoney,
  itemCount,
  moveToCart,
  removeItem,
  saveForLater,
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

test("createCart has empty items and saved", () => {
  assert.deepEqual(createCart(), { items: [], saved: [] });
});

test("saveForLater moves an item to saved", () => {
  const cart = saveForLater(addItem(addItem(createCart(), tee, 2), mug), "tee");
  assert.deepEqual(cart.items.map((i) => i.id), ["mug"]);
  assert.deepEqual(cart.saved.map((i) => [i.id, i.quantity]), [["tee", 2]]);
});

test("moveToCart moves a saved item back", () => {
  const cart = moveToCart(saveForLater(addItem(createCart(), tee, 2), "tee"), "tee");
  assert.equal(cart.saved.length, 0);
  assert.equal(itemCount(cart), 2);
});

test("moving merges quantities", () => {
  let cart = saveForLater(addItem(createCart(), tee, 2), "tee");
  cart = addItem(cart, tee, 1);
  const back = moveToCart(cart, "tee");
  assert.deepEqual(back.items.map((i) => i.quantity), [3]);
  const again = saveForLater(addItem(saveForLater(addItem(createCart(), tee), "tee"), tee, 4), "tee");
  assert.deepEqual(again.saved.map((i) => i.quantity), [5]);
});

test("unknown ids return the cart unchanged", () => {
  const cart = addItem(createCart(), tee);
  assert.equal(saveForLater(cart, "nope"), cart);
  assert.equal(moveToCart(cart, "nope"), cart);
});

test("moves do not mutate the input and old carts work", () => {
  const cart = addItem(createCart(), tee);
  const snapshot = JSON.stringify(cart);
  saveForLater(cart, "tee");
  assert.equal(JSON.stringify(cart), snapshot);
  const old = { items: cart.items };
  assert.deepEqual(saveForLater(old, "tee").saved.map((i) => i.id), ["tee"]);
  assert.equal(moveToCart(old, "tee"), old);
});

test("addItem and removeItem keep saved; totals ignore saved", () => {
  let cart = saveForLater(addItem(createCart(), tee), "tee");
  cart = removeItem(addItem(cart, mug), "mug");
  assert.equal(cart.saved.length, 1);
  cart = addItem(cart, mug);
  assert.equal(cart.saved.length, 1);
  assert.equal(itemCount(cart), 1);
  assert.equal(subtotal(cart), 16);
  assert.deepEqual(totals(cart), { subtotal: 16, tax: 1.28, total: 17.28 });
});
