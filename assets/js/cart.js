// === Gestion du panier ===

const CART_KEY = "publii_cart";

// Charger panier depuis localStorage
function loadCart() {
  return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
}

// Sauvegarder panier dans localStorage
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// Ajouter un produit
function addToCart(id, quantity = 1) {
  let cart = loadCart();
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ id, quantity });
  }
  saveCart(cart);
  alert("Produit ajouté au panier !");
}

// Afficher le panier
async function renderCart() {
  // Récupère la liste des produits statiques
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
  container.innerHTML += `<button onclick="checkout()">Payer</button>`;
}

// Passer au paiement (appel Worker)
async function checkout() {
  const cart = loadCart();
  const res = await fetch("/api/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cart })
  });
  const data = await res.json();
  if (data.url) {
    window.location.href = data.url;
  } else {
    alert("Erreur paiement");
  }
}
