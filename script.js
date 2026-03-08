const button = document.getElementById("addNote");
const container = document.getElementById("notesContainer");
const themeToggle = document.getElementById("themeToggle");

let notes = JSON.parse(localStorage.getItem("notes")) || [];
let currentEditIndex = null;

// theme initialization
function loadTheme(){
    const t = localStorage.getItem("theme") || "light";
    if(t === "dark") document.body.classList.add("dark-mode");
}
loadTheme();

themeToggle.onclick = () => {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("theme", isDark ? "dark" : "light");
};

function createEnvelope(text, index) {
    let envelope = document.createElement("div");
    envelope.className = "envelope";
    envelope.dataset.index = index;
    envelope.draggable = true;

    // show preview snippet
    let snippet = document.createElement("div");
    snippet.className = "snippet";
    snippet.textContent = text.length > 30 ? text.slice(0, 30) + "…" : text;
    envelope.appendChild(snippet);

    envelope.onclick = function () {
        openModal(text, index);
    };

    // drag/drop
    envelope.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', index);
    });
    envelope.addEventListener('dragover', e => {
        e.preventDefault();
    });
    envelope.addEventListener('drop', e => {
        e.preventDefault();
        const from = parseInt(e.dataTransfer.getData('text/plain'), 10);
        const to = index;
        if (from !== to) {
            const [moved] = notes.splice(from, 1);
            notes.splice(to, 0, moved);
            localStorage.setItem("notes", JSON.stringify(notes));
            renderNotes();
        }
    });

    container.appendChild(envelope);
}

function renderNotes() {
    // envelopes grid
    container.innerHTML = "";
    notes.forEach((note, i) => createEnvelope(note, i));

    // side list
    const list = document.getElementById("notesList");
    list.innerHTML = "";
    notes.forEach((note, i) => {
        const li = document.createElement("li");
        li.draggable = true;
        // show generic name instead of full text
        li.textContent = `Carta ${i + 1}`;

        const editBtn = document.createElement("button");
        editBtn.textContent = "Editar";
        editBtn.onclick = () => {
            openModal(note, i);
        };

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Borrar";
        deleteBtn.onclick = () => {
            if (confirm("¿Eliminar esta carta?")) {
                notes.splice(i, 1);
                localStorage.setItem("notes", JSON.stringify(notes));
                renderNotes();
            }
        };

        // drag/drop for list
        li.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', i);
        });
        li.addEventListener('dragover', e => e.preventDefault());
        li.addEventListener('drop', e => {
            e.preventDefault();
            const from = parseInt(e.dataTransfer.getData('text/plain'), 10);
            const to = i;
            if (from !== to) {
                const [moved] = notes.splice(from, 1);
                notes.splice(to, 0, moved);
                localStorage.setItem("notes", JSON.stringify(notes));
                renderNotes();
            }
        });

        li.appendChild(editBtn);
        li.appendChild(deleteBtn);
        list.appendChild(li);
    });
}

// modal elements
const modal = document.getElementById('noteModal');
const modalTitle = document.getElementById('modalTitle');
const noteText = document.getElementById('noteText');
const saveBtn = document.getElementById('saveNote');
const cancelBtn = document.getElementById('cancelNote');

function openModal(text = '', index = null) {
    currentEditIndex = index;
    modalTitle.textContent = index === null ? 'Nueva carta' : 'Editar carta';
    noteText.value = text;
    modal.classList.add('open');
    noteText.focus();
}

function closeModal() {
    modal.classList.remove('open');
    noteText.value = '';
    currentEditIndex = null;
}

saveBtn.onclick = () => {
    const text = noteText.value.trim();
    if (text) {
        if (currentEditIndex === null) {
            notes.push(text);
        } else {
            notes[currentEditIndex] = text;
        }
        localStorage.setItem("notes", JSON.stringify(notes));
        renderNotes();
    }
    closeModal();
};

cancelBtn.onclick = closeModal;

// initialize display
renderNotes();

button.onclick = () => openModal();