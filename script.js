// Configuración de Firebase (usa el SDK de Firebase v9 en modo compat vía CDN)
const firebaseConfig = {
  apiKey: "AIzaSyDwdWutjmuvxXu61CQxw3BI3VaP6SYdYN4",
  authDomain: "cartas-web.firebaseapp.com",
  projectId: "cartas-web",
  storageBucket: "cartas-web.firebasestorage.app",
  messagingSenderId: "648385945198",
  appId: "1:648385945198:web:3d30f0fc7dc6dabd3f107f",
  measurementId: "G-J3RFS0SNE5"
};

// Inicializa Firebase y Firestore
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const modal = document.getElementById("noteModal");
const modalTitle = document.getElementById("modalTitle");
const modalTextarea = document.getElementById("noteText");
const saveNoteBtn = document.getElementById("saveNote");
const deleteNoteBtn = document.getElementById("deleteNote");
const cancelNoteBtn = document.getElementById("cancelNote");
const themeToggle = document.getElementById("themeToggle");

let editingId = null;

function openModal(text = "", id = null) {
  editingId = id;
  modalTextarea.value = text;
  modalTitle.textContent = editingId ? "Editar carta" : "Nueva carta";
  modal.classList.add("open");

  if (editingId) {
    deleteNoteBtn.style.display = "inline-flex";
  } else {
    deleteNoteBtn.style.display = "none";
  }

  modalTextarea.focus();
}

function closeModal() {
  editingId = null;
  modal.classList.remove("open");
  deleteNoteBtn.style.display = "none";
}

function createEnvelopeCard(id, mensaje) {
  const envelope = document.createElement("div");
  envelope.className = "envelope";
  envelope.title = "Abrir carta";

  envelope.addEventListener("click", () => {
    openModal(mensaje, id);
  });

  return envelope;
}

async function cargarCartas() {
  const contenedor = document.getElementById("listaCartas");
  contenedor.innerHTML = "";

  try {
    const querySnapshot = await db
      .collection("cartas")
      .orderBy("creado", "desc")
      .get();

    querySnapshot.forEach((doc) => {
      const carta = doc.data();
      contenedor.appendChild(createEnvelopeCard(doc.id, carta.mensaje));
    });
  } catch (error) {
    console.error("Error cargando cartas:", error);
  }
}

async function guardarCarta(texto) {
  if (!texto || !texto.trim()) return;

  try {
    if (editingId) {
      await db.collection("cartas").doc(editingId).update({
        mensaje: texto.trim(),
      });
    } else {
      await db.collection("cartas").add({
        mensaje: texto.trim(),
        creado: firebase.firestore.FieldValue.serverTimestamp(),
      });
    }

    closeModal();
    document.getElementById("carta").value = "";
    cargarCartas();
  } catch (error) {
    console.error("Error guardando carta:", error);
  }
}

function enviarCarta() {
  const texto = document.getElementById("carta").value;
  guardarCarta(texto);
}

saveNoteBtn.addEventListener("click", () => guardarCarta(modalTextarea.value));

deleteNoteBtn.addEventListener("click", async () => {
  if (!editingId) return;
  if (!confirm("¿Eliminar esta carta?")) return;

  try {
    await db.collection("cartas").doc(editingId).delete();
    closeModal();
    cargarCartas();
  } catch (err) {
    console.error("Error al borrar carta:", err);
  }
});

cancelNoteBtn.addEventListener("click", closeModal);

modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("open")) {
    closeModal();
  }
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

cargarCartas();