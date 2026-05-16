// script.js

import { db, auth } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    updateDoc,
    getDoc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

/* ELEMENTOS */

const form =
    document.getElementById("formCadastro");

const lista =
    document.getElementById("listaClientes");

const usuarioLogado =
    document.getElementById("usuarioLogado");

const adminLink =
    document.getElementById("adminLink");

const logoutBtn =
    document.getElementById("logoutBtn");

/* CONTROLE */

let editId = null;

/* VERIFICA LOGIN */

onAuthStateChanged(auth, async (user) => {

    try {

        if (!user) {

            window.location.href =
                "login.html";

            return;
        }

        const usuarioRef =
            doc(db, "usuarios", user.uid);

        const usuarioSnap =
            await getDoc(usuarioRef);

        if (!usuarioSnap.exists()) {

            await signOut(auth);

            window.location.href =
                "login.html";

            return;
        }

        const dados =
            usuarioSnap.data();

        /* STATUS */

        if (dados.status !== "ativo") {

            alert(
                "Conta aguardando aprovação."
            );

            await signOut(auth);

            window.location.href =
                "login.html";

            return;
        }

        /* NOME */

        usuarioLogado.textContent =
            `👤 ${dados.nome || "Usuário"}`;

        /* ADMIN */

        if (dados.tipo === "admin") {

            adminLink.style.display =
                "inline-block";
        }

        /* CARREGAR DADOS */

        carregarRealtime();

    } catch (erro) {

        console.error(erro);

        alert("Erro ao verificar login.");

        window.location.href =
            "login.html";
    }

});

/* LOGOUT */

logoutBtn.addEventListener(
    "click",

    async () => {

        try {

            await signOut(auth);

            window.location.href =
                "login.html";

        } catch (erro) {

            console.error(erro);

            alert("Erro ao sair.");
        }
    }
);

/* REALTIME FIRESTORE */

function carregarRealtime() {

    lista.innerHTML =
        "<p>Carregando...</p>";

    onSnapshot(

        collection(db, "locais"),

        (snapshot) => {

            lista.innerHTML = "";

            if (snapshot.empty) {

                lista.innerHTML = `
                    <p class="vazio">
                        Nenhum endereço cadastrado.
                    </p>
                `;

                return;
            }

            snapshot.forEach((docItem) => {

                criarCliente(docItem);

            });

        },

        (erro) => {

            console.error(erro);

            lista.innerHTML = `
                <p>
                    Erro ao carregar dados.
                </p>
            `;
        }
    );
}

/* CRIAR CLIENTE */

function criarCliente(docItem) {

    const c =
        docItem.data();

    const div =
        document.createElement("div");

    div.className =
        "cliente";

    /* NOME */

    const h3 =
        document.createElement("h3");

    h3.textContent =
        c.nome || "Sem nome";

    /* ENDEREÇO */

    const p =
        document.createElement("p");

    p.textContent =
        c.endereco || "Sem endereço";

    /* AÇÕES */

    const acoes =
        document.createElement("div");

    acoes.className =
        "acoes";

    /* EDITAR */

    const btnEditar =
        document.createElement("button");

    btnEditar.textContent =
        "Editar";

    btnEditar.addEventListener(
        "click",

        () => editar(
            docItem.id,
            c.nome,
            c.endereco
        )
    );

    /* EXCLUIR */

    const btnExcluir =
        document.createElement("button");

    btnExcluir.textContent =
        "Excluir";

    btnExcluir.style.background =
        "#ef4444";

    btnExcluir.addEventListener(
        "click",

        () => excluir(docItem.id)
    );

    /* MAPA */

    const btnMapa =
        document.createElement("button");

    btnMapa.textContent =
        "Mapa";

    btnMapa.addEventListener(
        "click",

        () => mapa(
            c.latitude,
            c.longitude
        )
    );

    /* APPEND */

    acoes.append(
        btnEditar,
        btnExcluir,
        btnMapa
    );

    div.append(
        h3,
        p,
        acoes
    );

    lista.appendChild(div);
}

/* CADASTRAR / EDITAR */

form.addEventListener(

    "submit",

    async (e) => {

        e.preventDefault();

        const nome =
            document.getElementById("nome")
            .value
            .trim();

        const endereco =
            document.getElementById("endereco")
            .value
            .trim();

        if (!nome || !endereco) {

            alert(
                "Preencha todos os campos."
            );

            return;
        }

        if (!navigator.geolocation) {

            alert(
                "Geolocalização não suportada."
            );

            return;
        }

        navigator.geolocation.getCurrentPosition(

            async (pos) => {

                try {

                    const data = {

                        nome,
                        endereco,

                        latitude:
                            pos.coords.latitude,

                        longitude:
                            pos.coords.longitude,

                        atualizadoEm:
                            new Date()
                    };

                    /* EDITAR */

                    if (editId) {

                        await updateDoc(

                            doc(
                                db,
                                "locais",
                                editId
                            ),

                            data
                        );

                        editId = null;

                    }

                    /* NOVO */

                    else {

                        data.criadoEm =
                            new Date();

                        await addDoc(

                            collection(
                                db,
                                "locais"
                            ),

                            data
                        );
                    }

                    form.reset();

                } catch (erro) {

                    console.error(erro);

                    alert(
                        "Erro ao salvar."
                    );
                }

            },

            (erro) => {

                console.error(erro);

                alert(
                    "Permita acesso à localização."
                );
            }
        );
    }
);

/* EXCLUIR */

window.excluir = async (id) => {

    const confirmar =
        confirm(
            "Deseja excluir?"
        );

    if (!confirmar) return;

    try {

        await deleteDoc(

            doc(
                db,
                "locais",
                id
            )
        );

    } catch (erro) {

        console.error(erro);

        alert(
            "Erro ao excluir."
        );
    }
};

/* EDITAR */

window.editar = (

    id,
    nome,
    endereco

) => {

    document.getElementById("nome")
        .value = nome;

    document.getElementById("endereco")
        .value = endereco;

    editId = id;

    window.scrollTo({

        top: 0,

        behavior: "smooth"
    });
};

/* MAPA */

window.mapa = (lat, lng) => {

    if (!lat || !lng) {

        alert(
            "Localização não disponível."
        );

        return;
    }

    window.open(
        `https://www.google.com/maps?q=${lat},${lng}`,
        "_blank"
    );
};