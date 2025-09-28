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

// Ajouter produit depuis bouton
function addProduct(button) {
  const productEl = button.closest(".product");
  const id = productEl.dataset.id;
  const name = productEl.dataset.name;
  const price = parseInt(productEl.dataset.price, 10);
  const currency = productEl.dataset.currency;

  let cart = loadCart();
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id, name, price, currency, quantity: 1 });
  }
  saveCart(cart);

  // Badge et animation
  const badge = document.getElementById("cart-badge");
  if (badge) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = `🛒 ${totalItems}`;
    badge.classList.add("bounce");
    setTimeout(() => badge.classList.remove("bounce"), 300);
  }

  alert(`${name} ajouté au panier !`);
}

// Mettre à jour le badge panier
function updateCartBadge() {
  const cart = loadCart();
  const badge = document.getElementById("cart-badge");
  if (badge) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = `🛒 ${totalItems}`;
  }
}

// Afficher panier
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
}

// Exposer fonctions globalement
window.addProduct = addProduct;
window.renderCart = renderCart;

// Initialisation
document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
});
