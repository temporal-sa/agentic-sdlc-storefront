// Pure cart logic. Everything here is covered by tests/cart.test.js and has no DOM access,
// so it runs the same in the browser and under `node --test`.

export const TAX_RATE = 0.08;
export const DISCOUNT_CODE = "ORBIT10";
export const DISCOUNT_RATE = 0.1;
export const DISCOUNT_CODES = { [DISCOUNT_CODE]: DISCOUNT_RATE };
export const INVALID_CODE_MESSAGE = "That code isn't valid";

export function createCart() {
  return { items: [], discountCode: null };
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

export function applyDiscountCode(cart, code) {
  const normalizedCode = String(code).trim().toUpperCase();
  if (normalizedCode in DISCOUNT_CODES) {
    return { ok: true, cart: { ...cart, discountCode: normalizedCode } };
  }
  return { ok: false, cart, error: INVALID_CODE_MESSAGE };
}

export function itemCount(cart) {
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

export function subtotal(cart) {
  return roundCents(cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0));
}

export function discountAmount(cart) {
  const sub = subtotal(cart);
  const rate = DISCOUNT_CODES[cart.discountCode] ?? 0;
  return roundCents(sub * rate);
}

export function totals(cart) {
  const sub = subtotal(cart);
  const discount = discountAmount(cart);
  const tax = roundCents((sub - discount) * TAX_RATE);
  return { subtotal: sub, discount, tax, total: roundCents(sub - discount + tax) };
}

export function formatMoney(amount) {
  return `$${amount.toFixed(2)}`;
}

export function roundCents(amount) {
  return Math.round(amount * 100) / 100;
}
