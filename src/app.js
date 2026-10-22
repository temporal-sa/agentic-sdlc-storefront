// DOM wiring for the storefront. Business rules live in cart.js.
import { addItem, createCart, formatMoney, itemCount, removeItem, totals } from "./cart.js";

import { nextTheme, readStoredTheme, resolveTheme, saveTheme } from "./theme.js";

let cart = createCart();
let products = [];

function safeStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function syncToggle(theme) {
  const button = document.querySelector("#theme-toggle");
  if (!button) return;
  const dark = theme === "dark";
  button.setAttribute("aria-pressed", String(dark));
  button.textContent = dark ? "Light mode" : "Dark mode";
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  syncToggle(theme);
}

function initTheme() {
  const storage = safeStorage();
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(resolveTheme(readStoredTheme(storage), prefersDark));
  document.querySelector("#theme-toggle")?.addEventListener("click", () => {
    const theme = nextTheme(document.documentElement.dataset.theme);
    applyTheme(theme);
    saveTheme(storage, theme);
  });
}

async function main() {
  initTheme();
  const response = await fetch("./products.json");
  products = await response.json();
  renderProducts();
  renderCart();
}

function renderProducts() {
  const grid = document.querySelector("#products");
  grid.innerHTML = "";
  for (const product of products) {
    const card = document.createElement("article");
    card.className = "product";
    card.innerHTML = `
      <div class="product-emoji" aria-hidden="true">${product.emoji}</div>
      <h3>${product.name}</h3>
      <p class="price">${formatMoney(product.price)}</p>
      <button type="button">Add to cart</button>`;
    card.querySelector("button").addEventListener("click", () => {
      cart = addItem(cart, product);
      renderCart();
    });
    grid.appendChild(card);
  }
}

function renderCart() {
  const list = document.querySelector("#cart-items");
  list.innerHTML = "";
  for (const item of cart.items) {
    const row = document.createElement("li");
    row.innerHTML = `<span>${item.name} × ${item.quantity}</span>
      <span>${formatMoney(item.price * item.quantity)}</span>
      <button type="button" class="link" aria-label="Remove ${item.name}">Remove</button>`;
    row.querySelector("button").addEventListener("click", () => {
      cart = removeItem(cart, item.id);
      renderCart();
    });
    list.appendChild(row);
  }
  const { subtotal, tax, total } = totals(cart);
  document.querySelector("#cart-count").textContent = String(itemCount(cart));
  document.querySelector("#subtotal").textContent = formatMoney(subtotal);
  document.querySelector("#tax").textContent = formatMoney(tax);
  document.querySelector("#total").textContent = formatMoney(total);
  document.querySelector("#empty").hidden = cart.items.length > 0;
}

main();
