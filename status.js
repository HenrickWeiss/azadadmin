import { supabase } from "./supabase.js";

const orderIdInput = document.getElementById("orderIdInput");
const checkStatusBtn = document.getElementById("checkStatusBtn");
const statusResult = document.getElementById("statusResult");

checkStatusBtn.addEventListener("click", async () => {
  const id = orderIdInput.value.trim();

  if (!id) {
    statusResult.innerText = "Bitte eine Bestell-ID eingeben.";
    return;
  }

  const { data, error } = await supabase
    .rpc("get_order_status", { order_id: Number(id) });

  const order = data?.[0];

  if (error || !order) {
    statusResult.innerText = "Bestellung nicht gefunden.";
    return;
  }

  statusResult.innerHTML = `
    <p><strong>Status:</strong> ${order.status}</p>
    <p><strong>Name:</strong> ${order.customer_name || "—"}</p>
    <p><strong>Gesamt:</strong> ${Number(order.total).toFixed(2)} €</p>
  `;
});

