// DOM wiring for the storefront. Business rules live in cart.js.
import { addItem, createCart, formatMoney, itemCount, removeItem, totals } from "./cart.js";

let cart = createCart();
let products = [];

async function main() {
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
      <span class="row-actions">
        <button type="button" class="link" data-action="save" aria-label="Save ${item.name} for later">Save for later</button>
        <button type="button" class="link" data-action="remove" aria-label="Remove ${item.name}">Remove</button>
      </span>`;
    row.querySelector('[data-action="save"]').addEventListener("click", () => {
      cart = saveForLater(cart, item.id);
      renderCart();
    });
    row.querySelector('[data-action="remove"]').addEventListener("click", () => {
      cart = removeItem(cart, item.id);
      renderCart();
    });
    list.appendChild(row);
  }
  const saved = cart.saved || [];
  const savedList = document.querySelector("#saved-items");
  savedList.innerHTML = "";
  for (const item of saved) {
    const row = document.createElement("li");
    row.innerHTML = `<span>${item.name} × ${item.quantity}</span>
      <span>${formatMoney(item.price * item.quantity)}</span>
      <button type="button" class="link" aria-label="Move ${item.name} to cart">Move to cart</button>`;
    row.querySelector("button").addEventListener("click", () => {
      cart = moveToCart(cart, item.id);
      renderCart();
    });
    savedList.appendChild(row);
  }
  document.querySelector("#saved-empty").hidden = saved.length > 0;
  const { subtotal, tax, total } = totals(cart);
  document.querySelector("#cart-count").textContent = String(itemCount(cart));
  document.querySelector("#subtotal").textContent = formatMoney(subtotal);
  document.querySelector("#tax").textContent = formatMoney(tax);
  document.querySelector("#total").textContent = formatMoney(total);
  document.querySelector("#empty").hidden = cart.items.length > 0;
}

main();
