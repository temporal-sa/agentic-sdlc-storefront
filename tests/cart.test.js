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

const sampleProducts = [
  { id: "tee", name: "Orbit Tee", price: 28 },
  { id: "mug", name: "Supply Mug", price: 16 },
  { id: "cap", name: "Baseball Cap", price: 22 },
];

test("filterProducts returns all products in order when query is empty or whitespace", () => {
  const resultEmpty = filterProducts(sampleProducts, "");
  assert.deepEqual(resultEmpty, sampleProducts);
  assert.notStrictEqual(resultEmpty, sampleProducts);

  const resultSpaces = filterProducts(sampleProducts, "   \t ");
  assert.deepEqual(resultSpaces, sampleProducts);
  assert.notStrictEqual(resultSpaces, sampleProducts);
});

test("filterProducts is case-insensitive", () => {
  const result = filterProducts(sampleProducts, "TEE");
  assert.deepEqual(result, [{ id: "tee", name: "Orbit Tee", price: 28 }]);
});

test("filterProducts matches in the middle of a name", () => {
  const result = filterProducts(sampleProducts, "pply");
  assert.deepEqual(result, [{ id: "mug", name: "Supply Mug", price: 16 }]);
});

test("filterProducts returns [] when no products match", () => {
  const result = filterProducts(sampleProducts, "nonexistent");
  assert.deepEqual(result, []);
});

test("filterProducts does not mutate the input products array", () => {
  const products = [
    { id: "tee", name: "Orbit Tee", price: 28 },
    { id: "mug", name: "Supply Mug", price: 16 },
  ];
  const copy = JSON.parse(JSON.stringify(products));
  filterProducts(products, "tee");
  filterProducts(products, "");
  filterProducts(products, "xyz");
  assert.deepEqual(products, copy);
});

test("filtering products by name (case-insensitive)", () => {
  const products = [
    { id: "1", name: "Orbit Hoodie" },
    { id: "2", name: "Orbit Mug" },
    { id: "3", name: "Sticker Pack" },
  ];
  assert.deepEqual(filterProducts(products, "orbit").map((p) => p.id), ["1", "2"]);
  assert.deepEqual(filterProducts(products, "MUG").map((p) => p.id), ["2"]);
  assert.deepEqual(filterProducts(products, "  pack  ").map((p) => p.id), ["3"]);
  assert.deepEqual(filterProducts(products, ""), products);
  assert.deepEqual(filterProducts(products, "nonexistent"), []);
});
