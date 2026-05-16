import { db, auth } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import {
    collection,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

/* ELEMENTOS */

const usuarioLogado =
    document.getElementById("usuarioLogado");

const listaUsuarios =
    document.getElementById("listaUsuarios");

const totalClientes =
    document.getElementById("totalClientes");

const totalUsuarios =
    document.getElementById("totalUsuarios");

const totalPendentes =
    document.getElementById("totalPendentes");

/* AUTH */

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    try {

        const usuarioRef =
            doc(db, "usuarios", user.uid);

        const usuarioSnap =
            await getDoc(usuarioRef);

        if (!usuarioSnap.exists()) {

            alert("Usuário inválido.");
            window.location.href = "login.html";
            return;
        }

        const dados = usuarioSnap.data();

        if (dados.tipo !== "admin") {

            alert("Acesso negado.");
            window.location.href = "index.html";
            return;
        }

        usuarioLogado.innerHTML =
            `👤 ${dados.nome || "Administrador"}`;

        await carregarDashboard();

    } catch (erro) {

        console.error("AUTH ERROR:", erro);

        alert("Erro ao carregar painel.");
    }

});

/* DASHBOARD */

async function carregarDashboard() {

    try {

        listaUsuarios.innerHTML = "<p>Carregando...</p>";

        const [clientesSnap, usuariosSnap] =
            await Promise.all([
                getDocs(collection(db, "locais")),
                getDocs(collection(db, "usuarios"))
            ]);

        totalClientes.innerHTML = clientesSnap.size;
        totalUsuarios.innerHTML = usuariosSnap.size;

        listaUsuarios.innerHTML = "";

        let pendentes = 0;

        usuariosSnap.forEach((docItem) => {

            const u = docItem.data();
            const id = docItem.id;

            if (!id) return; // proteção

            if (u.status === "pendente") {
                pendentes++;
            }

            listaUsuarios.innerHTML += `
                <div class="cliente">

                    <h3>${u.nome || "Sem nome"}</h3>
                    <p>${u.email || ""}</p>
                    <p>Status: ${u.status || "desconhecido"}</p>
                    <p>Tipo: ${u.tipo || "motorista"}</p>

                    <div class="acoes">

                        ${
                            u.status === "pendente"
                            ? `<button onclick="aprovar('${id}')">Aprovar</button>`
                            : `<button onclick="bloquear('${id}')">Bloquear</button>`
                        }

                        <button
                            onclick="excluirUsuario('${id}')"
                            style="background:#ef4444"
                        >
                            Excluir
                        </button>

                    </div>

                </div>
            `;
        });

        totalPendentes.innerHTML = pendentes;

    } catch (erro) {

        console.error("DASHBOARD ERROR:", erro);

        alert("Erro ao carregar dashboard.");
    }
}

/* 🔥 APROVAR */

window.aprovar = async (id) => {

    try {

        console.log("Aprovando ID:", id);

        await updateDoc(
            doc(db, "usuarios", id),
            {
                status: "ativo"
            }
        );

        alert("Usuário aprovado!");

        await carregarDashboard();

    } catch (erro) {

        console.error("ERRO APROVAR:", erro);

        alert(erro.message);
    }
};

/* 🚫 BLOQUEAR */

window.bloquear = async (id) => {

    if (!confirm("Bloquear usuário?")) return;

    try {

        console.log("Bloqueando ID:", id);

        await updateDoc(
            doc(db, "usuarios", id),
            {
                status: "bloqueado"
            }
        );

        await carregarDashboard();

    } catch (erro) {

        console.error("ERRO BLOQUEIO:", erro);

        alert(erro.message);
    }
};

/* 🗑 EXCLUIR */

window.excluirUsuario = async (id) => {

    if (!confirm("Excluir usuário?")) return;

    try {

        console.log("Excluindo ID:", id);

        await deleteDoc(doc(db, "usuarios", id));

        await carregarDashboard();

    } catch (erro) {

        console.error("ERRO DELETE:", erro);

        alert(erro.message);
    }
};