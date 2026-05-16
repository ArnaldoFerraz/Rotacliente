import { auth, db } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

const form = document.getElementById("formCadastroUsuario");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;

  const userCredential = await createUserWithEmailAndPassword(auth, email, senha);

  const user = userCredential.user;

  await setDoc(doc(db, "usuarios", user.uid), {
    nome,
    email,
    tipo: "motorista",
    status: "pendente"
  });

  await signOut(auth);

  window.location.href = "login.html";
});