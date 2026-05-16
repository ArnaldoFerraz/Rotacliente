
// pesquisa.js

import { db, auth } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import {
    collection,
    getDocs,
    deleteDoc,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

/* ELEMENTOS */

const resultado =
    document.getElementById("resultadoPesquisa");

const usuarioLogado =
    document.getElementById("usuarioLogado");

const adminLink =
    document.getElementById("adminLink");

const logoutBtn =
    document.getElementById("logoutBtn");

const campoPesquisa =
    document.getElementById("pesquisa");

/* VERIFICA INPUT */
if (!campoPesquisa) {
    console.error("Campo de pesquisa não encontrado");
}

/* VERIFICA LOGIN */

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    try {

        const usuarioRef = doc(db, "usuarios", user.uid);

        const usuarioSnap = await getDoc(usuarioRef);

        if (!usuarioSnap.exists()) {
            window.location.href = "login.html";
            return;
        }

        const dados = usuarioSnap.data();

        if (dados.status !== "ativo") {

            alert("Conta aguardando aprovação.");

            await signOut(auth);

            window.location.href = "login.html";

            return;
        }

        usuarioLogado.innerHTML =
            `👤 ${dados.nome}`;

        if (dados.tipo === "admin") {

            adminLink.style.display =
                "inline-block";
        }

    } catch (erro) {

        console.error(erro);
        window.location.href = "login.html";
    }
});

/* LOGOUT */

if (logoutBtn) {

    logoutBtn.addEventListener("click", async (e) => {

        e.preventDefault();

        await signOut(auth);

        window.location.href = "login.html";
    });
}

/* MAPA */

window.mapa = (lat, lng) => {

    if (!lat || !lng) {
        alert("Localização não disponível.");
        return;
    }

    window.open(
        `https://www.google.com/maps?q=${lat},${lng}`,
        "_blank"
    );
};

/* WAZE */

window.waze = (lat, lng) => {

    if (!lat || !lng) {
        alert("Localização não disponível.");
        return;
    }

    window.open(
        `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`,
        "_blank"
    );
};

/* EXCLUIR */

window.excluir = async (id) => {

    const confirmar = confirm("Deseja excluir este cliente?");

    if (!confirmar) return;

    try {

        await deleteDoc(doc(db, "locais", id));

        pesquisar();

    } catch (erro) {

        console.error(erro);

        alert("Erro ao excluir cliente.");
    }
};

/* PESQUISAR */

async function pesquisar() {

    const termo =
        (campoPesquisa?.value || "")
        .trim()
        .toLowerCase();

    if (!termo) {

        resultado.innerHTML = `
            <p class="vazio">
                Digite algo para pesquisar.
            </p>
        `;

        return;
    }

    resultado.innerHTML =
        "<p>Pesquisando...</p>";

    try {

        const snap =
            await getDocs(collection(db, "locais"));

        resultado.innerHTML = "";

        let achou = false;

        snap.forEach((docItem) => {

            const c = docItem.data();

            const nome =
                (c.nome || "")
                .toLowerCase();

            const endereco =
                (c.endereco || "")
                .toLowerCase();

            if (
                nome.includes(termo) ||
                endereco.includes(termo)
            ) {

                achou = true;

                resultado.innerHTML += `
                    <div class="cliente">

                        <h3>${c.nome}</h3>

                        <p>${c.endereco}</p>

                        <div class="acoes">

                            <button onclick="mapa(${c.latitude}, ${c.longitude})">
                                Maps
                            </button>

                            <button onclick="waze(${c.latitude}, ${c.longitude})">
                                Waze
                            </button>

                            <button onclick="excluir('${docItem.id}')" style="background:#ef4444">
                                Excluir
                            </button>

                        </div>

                    </div>
                `;
            }

        });

        if (!achou) {

            resultado.innerHTML = `
                <p class="vazio">
                    Nenhum resultado encontrado.
                </p>
            `;
        }

    } catch (erro) {

        console.error(erro);

        resultado.innerHTML = `
            <p class="vazio">
                Erro ao conectar com o banco.
            </p>
        `;
    }
}

/* BOTÃO PESQUISAR (CORRETO) */

const formPesquisa = document.getElementById("formPesquisa");

if (formPesquisa) {

    formPesquisa.addEventListener("submit", (e) => {

        e.preventDefault();

        pesquisar();
    });
}

/* AUTOCOMPLETE (SEM QUEBRAR BUSCA) */

let timeout = null;

if (campoPesquisa) {

    campoPesquisa.addEventListener("input", () => {

        clearTimeout(timeout);

        timeout = setTimeout(() => {

            // só feedback leve, não limpa resultados
            if (campoPesquisa.value.trim().length === 0) {

                resultado.innerHTML = `
                    <p class="vazio">
                        Digite algo para pesquisar.
                    </p>
                `;
            }

        }, 300);
    });
}

/* INICIAL */

resultado.innerHTML = `
    <p class="vazio">
        Digite algo para pesquisar.
    </p>
`;