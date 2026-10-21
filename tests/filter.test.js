import { test } from "node:test";
import assert from "node:assert/strict";
import { filterProducts } from "../src/cart.js";

const sampleProducts = [
  { id: "tee", name: "Orbit T-Shirt", price: 28 },
  { id: "mug", name: "Coffee Mug", price: 16 },
  { id: "sticker", name: "Logo Sticker", price: 4 },
];

test("case-insensitive matching ('MUG' finds 'Coffee Mug')", () => {
  const result = filterProducts(sampleProducts, "MUG");
  assert.deepEqual(result, [{ id: "mug", name: "Coffee Mug", price: 16 }]);
});

test("matching in the middle of a name", () => {
  const result = filterProducts(sampleProducts, "offee");
  assert.deepEqual(result, [{ id: "mug", name: "Coffee Mug", price: 16 }]);
});

test("empty and spaces-only queries return everything", () => {
  assert.deepEqual(filterProducts(sampleProducts, ""), sampleProducts);
  assert.deepEqual(filterProducts(sampleProducts, "   "), sampleProducts);
  assert.deepEqual(filterProducts(sampleProducts, null), sampleProducts);
  assert.deepEqual(filterProducts(sampleProducts, undefined), sampleProducts);
});

test("leading and trailing spaces are ignored", () => {
  const result = filterProducts(sampleProducts, "  Shirt  ");
  assert.deepEqual(result, [{ id: "tee", name: "Orbit T-Shirt", price: 28 }]);
});

test("no matches returns empty array", () => {
  const result = filterProducts(sampleProducts, "nonexistent");
  assert.deepEqual(result, []);
});

test("order of products is kept", () => {
  const result = filterProducts(sampleProducts, "o");
  assert.deepEqual(result, [
    { id: "tee", name: "Orbit T-Shirt", price: 28 },
    { id: "mug", name: "Coffee Mug", price: 16 },
    { id: "sticker", name: "Logo Sticker", price: 4 },
  ]);
});

test("input array stays unchanged", () => {
  const copyBefore = JSON.parse(JSON.stringify(sampleProducts));
  const result = filterProducts(sampleProducts, "");
  assert.deepEqual(sampleProducts, copyBefore);
  assert.notEqual(result, sampleProducts);
});
