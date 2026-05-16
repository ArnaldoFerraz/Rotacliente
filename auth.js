console.log("LOGIN CARREGADO");

import { auth, db } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

const form = document.getElementById("formLogin");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  const userCredential = await signInWithEmailAndPassword(auth, email, senha);

  const user = userCredential.user;

  const snap = await getDoc(doc(db, "usuarios", user.uid));

  if (!snap.exists()) {
    await signOut(auth);
    alert("Usuário não encontrado");
    return;
  }

  const dados = snap.data();

  if (dados.status === "pendente") {
    await signOut(auth);
    alert("Conta pendente");
    return;
  }

  if (dados.tipo === "admin") {
    window.location.href = "painel.html";
    return;
  }

  window.location.href = "index.html";
});