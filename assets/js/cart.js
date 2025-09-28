const CART_KEY = "publii_cart";

// Charger panier
function loadCart() {
  return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
}

// Sauver panier
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

// Ajouter produit à partir d'un bouton
function addProduct(button) {
  const productEl = button.closest(".product");
  const id = productEl.dataset.id;
  const name = productEl.dataset.name;
  const price = parseInt(productEl.dataset.price);
  const currency = productEl.dataset.currency;

  let cart = loadCart();
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id, name, price, currency, quantity: 1 });
  }
  saveCart(cart);

  // Animation badge
  const badge = document.getElementById("cart-badge");
  if (badge) {
    badge.classList.add("bounce");
    setTimeout(() => badge.classList.remove("bounce"), 300);
  }

  alert(`${name} ajouté au panier !`);
}

// Afficher panier (sur page cart.html)
function renderCart() {
  const cart = loadCart();
  const container = document.getElementById("cart");
  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = "<p>Panier vide.</p>";
    return;
  }

  let total = 0;
  cart.forEach(item => {
    total += item.price * item.quantity;
    container.innerHTML += `
      <div>
        ${item.name} x ${item.quantity} — ${(item.price / 100).toFixed(2)} €
      </div>`;
  });

  container.innerHTML += `<p><strong>Total: ${(total / 100).toFixed(2)} €</strong></p>`;
  container.innerHTML += `
    <form id="checkout-form" onsubmit="checkout(event)">
      <input type="email" id="customer-email" placeholder="Votre email" required>
      <button type="submit">Payer</button>
    </form>`;
}

// Mettre à jour la gélule flottante
function updateCartBadge() {
  const cart = loadCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById("cart-badge");
  if (badge) badge.textContent = `🛒 ${totalItems}`;
}

// Paiement → appel Worker
async function checkout(event) {
  if (event) event.preventDefault();

  const cart = loadCart();
  const email = document.getElementById("customer-email")?.value || "";

  const res = await fetch("/api/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cart, email })
  });
  const data = await res.json();
  if (data.url) {
    window.location.href = data.url;
  } else {
    alert("Erreur paiement");
  }
}

// Initialisation
document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
});
