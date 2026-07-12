import { supabase } from "./supabase.js";

// ===== LOGIN =====
const loginContainer = document.getElementById("loginContainer");
const ordersContainer = document.getElementById("ordersContainer");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginError = document.getElementById("loginError");

let realtimeChannel = null;

async function showOrders() {
  loginContainer.style.display = "none";
  ordersContainer.style.display = "block";
  await initOrders();
}

function showLogin() {
  loginContainer.style.display = "flex";
  ordersContainer.style.display = "none";
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }
}

// Beim Laden prüfen, ob bereits eine Session besteht (Login bleibt erhalten)
const { data: { session } } = await supabase.auth.getSession();
if (session) {
  showOrders();
}

loginBtn.addEventListener("click", async () => {
  loginError.style.display = "none";
  const email = usernameInput.value.trim();
  const password = passwordInput.value;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    loginError.style.display = "block";
    return;
  }

  passwordInput.value = "";
  showOrders();
});

logoutBtn.addEventListener("click", async () => {
  await supabase.auth.signOut();
  showLogin();
});

// ===== TOAST =====
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.innerText = msg;
  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  }, 1800);
}

// ===== ORDERS LOGIC =====
const ordersDiv = document.getElementById("orders");
const deleteAllBtn = document.getElementById("deleteAllBtn");
const newOrderSound = document.getElementById("newOrderSound");

function renderOrders(orders, previousIds) {
  ordersDiv.innerHTML = "";
  const currentIds = new Set();

  orders.forEach(order => {
    const id = order.id;
    currentIds.add(id);

    const div = document.createElement("div");
    div.className = `order ${order.status}`;
    div.innerHTML = `
      <h3>Bestellung #${id}</h3>

      <p><strong>Name:</strong> ${order.customer_name || "—"}</p>
      <p><strong>Telefon:</strong> ${order.customer_phone || "—"}</p>

      <p><strong>Zahlungsart:</strong> ${order.payment_method || "—"}</p>

      <ul>
        ${order.items.map(i => `<li>${i.name} – ${Number(i.price).toFixed(2)} €</li>`).join("")}
      </ul>

      <p><strong>Gesamt: ${Number(order.total).toFixed(2)} €</strong></p>
      <p>Status: <b>${order.status}</b></p>

      <button data-status="in Arbeit">In Arbeit</button>
      <button data-status="fertig">Fertig</button>
      <button data-delete>🗑️ Löschen</button>
      <hr>
    `;

    // Status-Buttons
    div.querySelectorAll("button[data-status]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const newStatus = btn.dataset.status;
        const { error } = await supabase
          .from("orders")
          .update({ status: newStatus })
          .eq("id", id);

        if (!error) {
          showToast(`Bestellung #${id} ist jetzt: ${newStatus}`);
        }
      });
    });

    // Einzelne Bestellung löschen
    div.querySelector("button[data-delete]").addEventListener("click", async () => {
      if (confirm("Bestellung wirklich löschen?")) {
        await supabase.from("orders").delete().eq("id", id);
      }
    });

    ordersDiv.appendChild(div);
  });

  // Sound abspielen, wenn neue Bestellung dazugekommen ist
  if (previousIds) {
    const newOrders = [...currentIds].filter(x => !previousIds.has(x));
    if (newOrders.length > 0) {
      newOrderSound.play().catch(() => {});
    }
  }

  return currentIds;
}

async function fetchAndRenderOrders(previousIds) {
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return previousIds || new Set();
  }

  return renderOrders(orders, previousIds);
}

async function initOrders() {
  let lastOrderIds = await fetchAndRenderOrders();

  // Live-Updates: bei jeder Änderung an der orders-Tabelle neu laden
  realtimeChannel = supabase
    .channel("orders-admin")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "orders" },
      async () => {
        lastOrderIds = await fetchAndRenderOrders(lastOrderIds);
      }
    )
    .subscribe();

  // Alle Bestellungen löschen
  deleteAllBtn.addEventListener("click", async () => {
    if (confirm("Alle Bestellungen wirklich löschen?")) {
      await supabase.from("orders").delete().gte("id", 0);
    }
  });
}
