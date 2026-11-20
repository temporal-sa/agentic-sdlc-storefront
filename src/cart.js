// Pure cart logic. Everything here is covered by tests/cart.test.js and has no DOM access,
// so it runs the same in the browser and under `node --test`. Money helpers come from the
// orbit-money package (package.json for Node, the import map in index.html for the browser).

import { formatMoney, roundCents } from "orbit-money";

export { formatMoney };

export const TAX_RATE = 0.08;

export function createCart() {
  return { items: [] };
}

export function addItem(cart, product, quantity = 1) {
  if (quantity <= 0) throw new Error("quantity must be positive");
  const existing = cart.items.find((item) => item.id === product.id);
  if (existing) {
    return {
      ...cart,
      items: cart.items.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item,
      ),
    };
  }
  return { ...cart, items: [...cart.items, { id: product.id, name: product.name, price: product.price, quantity }] };
}

export function removeItem(cart, productId) {
  return { ...cart, items: cart.items.filter((item) => item.id !== productId) };
}

export function itemCount(cart) {
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

export function subtotal(cart) {
  return roundCents(cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0));
}

export function shippingCost(cart) {
  if (cart.items.length === 0) return 0;
  return subtotal(cart) >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}

export function freeShippingProgress(cart) {
  const sub = subtotal(cart);
  const remaining = Math.max(0, roundCents(FREE_SHIPPING_THRESHOLD - sub));
  const percent = Math.min(100, Math.max(0, (sub / FREE_SHIPPING_THRESHOLD) * 100));
  return { remaining, unlocked: sub >= FREE_SHIPPING_THRESHOLD, percent };
}

export function totals(cart) {
  const sub = subtotal(cart);
  const shipping = shippingCost(cart);
  const tax = roundCents(sub * TAX_RATE);
  return { subtotal: sub, shipping, tax, total: roundCents(sub + shipping + tax) };
}

