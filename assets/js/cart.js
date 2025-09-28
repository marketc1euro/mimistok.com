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

// Ajouter produit
function addToCart(id, quantity = 1) {
  let cart = loadCart();
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ id, quantity });
  }
  saveCart(cart);

  // Animation badge
  const badge = document.getElementById("cart-badge");
  if (badge) {
    badge.classList.add("bounce");
    setTimeout(() => badge.classList.remove("bounce"), 300);
  }
}

// Afficher panier (sur page cart.html)
async function renderCart() {
  const res = await fetch("/media/files/products.json");
  const products = await res.json();
  const cart = loadCart();

  const container = document.getElementById("cart");
  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = "<p>Panier vide.</p>";
    return;
  }

  let total = 0;
  cart.forEach(item => {
    const product = products.find(p => p.id === item.id);
    if (product) {
      total += product.price * item.quantity;
      container.innerHTML += `
        <div>
          ${product.name} x ${item.quantity} — ${(product.price / 100).toFixed(2)} €
        </div>`;
    }
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
