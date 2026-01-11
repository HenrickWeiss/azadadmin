import { db } from "./firebase.js";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ===== LOGIN =====
const loginContainer = document.getElementById("loginContainer");
const ordersContainer = document.getElementById("ordersContainer");
const loginBtn = document.getElementById("loginBtn");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginError = document.getElementById("loginError");

// Admin-Zugang
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "123456";

loginBtn.addEventListener("click", () => {
  const user = usernameInput.value;
  const pass = passwordInput.value;

  if (user === ADMIN_USERNAME && pass === ADMIN_PASSWORD) {
    loginContainer.style.display = "none";
    ordersContainer.style.display = "block";
    initOrders();
  } else {
    loginError.style.display = "block";
  }
});

// ===== ORDERS LOGIC =====
const ordersDiv = document.getElementById("orders");
const deleteAllBtn = document.getElementById("deleteAllBtn");
const newOrderSound = document.getElementById("newOrderSound");

function initOrders() {
  let lastOrderIds = new Set();

  const q = query(
    collection(db, "orders"),
    orderBy("createdAt", "desc")
  );

  onSnapshot(q, snapshot => {
    ordersDiv.innerHTML = "";
    const currentIds = new Set();

    snapshot.forEach(docSnap => {
      const order = docSnap.data();
      const id = docSnap.id;
      currentIds.add(id);

      const div = document.createElement("div");
      div.className = `order ${order.status}`;
      div.innerHTML = `
        <h3>Bestellung #${id}</h3>
        <ul>
          ${order.items.map(i => `<li>${i.name} – ${i.price.toFixed(2)} €</li>`).join("")}
        </ul>
        <p><strong>Gesamt: ${order.total.toFixed(2)} €</strong></p>
        <p>Status: <b>${order.status}</b></p>
        <button data-status="in Arbeit">In Arbeit</button>
        <button data-status="fertig">Fertig</button>
        <button data-delete>🗑️ Löschen</button>
        <hr>
      `;

      // Status-Buttons
      div.querySelectorAll("button[data-status]").forEach(btn => {
        btn.addEventListener("click", async () => {
          await updateDoc(doc(db, "orders", id), {
            status: btn.dataset.status
          });
        });
      });

      // Einzelne Bestellung löschen
      div.querySelector("button[data-delete]").addEventListener("click", async () => {
        if(confirm("Bestellung wirklich löschen?")) {
          await deleteDoc(doc(db, "orders", id));
        }
      });

      ordersDiv.appendChild(div);
    });

    // Sound abspielen, wenn neue Bestellung
    const newOrders = [...currentIds].filter(x => !lastOrderIds.has(x));
    if (newOrders.length > 0) {
      newOrderSound.play().catch(() => {});
    }

    lastOrderIds = currentIds;
  });

  // Alle Bestellungen löschen
  deleteAllBtn.addEventListener("click", async () => {
    if(confirm("Alle Bestellungen wirklich löschen?")) {
      const snapshot = await getDocs(collection(db, "orders"));
      snapshot.docs.forEach(async docSnap => {
        await deleteDoc(doc(db, "orders", docSnap.id));
      });
    }
  });
}
