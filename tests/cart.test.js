import { test } from "node:test";
import assert from "node:assert/strict";
import { addItem, createCart, filterProducts, formatMoney, itemCount, removeItem, subtotal, totals } from "../src/cart.js";

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

const catalog = [
  { id: "tee", name: "Orbit Tee", price: 28 },
  { id: "mug", name: "Space Mug", price: 16 },
  { id: "cap", name: "Orbit Cap", price: 20 },
];

test("filterProducts returns all products for empty, blank or undefined query", () => {
  assert.deepEqual(filterProducts(catalog, ""), catalog);
  assert.deepEqual(filterProducts(catalog, "   "), catalog);
  assert.deepEqual(filterProducts(catalog, undefined), catalog);
});

test("filterProducts is case-insensitive and matches mid-name", () => {
  assert.deepEqual(filterProducts(catalog, "MUG").map((p) => p.id), ["mug"]);
  assert.deepEqual(filterProducts(catalog, "ace m").map((p) => p.id), ["mug"]);
});

test("filterProducts ignores surrounding spaces", () => {
  assert.deepEqual(filterProducts(catalog, "  tee ").map((p) => p.id), ["tee"]);
});

test("filterProducts returns empty array when nothing matches", () => {
  assert.deepEqual(filterProducts(catalog, "zzz"), []);
});

test("filterProducts keeps order and does not mutate input", () => {
  const copy = [...catalog];
  assert.deepEqual(filterProducts(catalog, "orbit").map((p) => p.id), ["tee", "cap"]);
  const all = filterProducts(catalog, "");
  assert.notEqual(all, catalog);
  assert.deepEqual(catalog, copy);
});
