import React, { createContext, useState, useEffect } from "react";
import { api } from "../services/api";


export const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
const [usuario, setUsuario] = useState(null);


useEffect(() => {
const u = localStorage.getItem("usuario");
if (u) setUsuario(JSON.parse(u));
}, []);


useEffect(() => {
if (usuario) localStorage.setItem("usuario", JSON.stringify(usuario));
else localStorage.removeItem("usuario");
}, [usuario]);


const login = async (usuarioInput, senhaInput) => {
try {
const res = await api.post("/auth/login", { usuario: usuarioInput, senha: senhaInput });
// a procedure retorna normalmente array aninhado; tratamos com flexibilidade
let resposta = res.data;
if (Array.isArray(resposta)) resposta = resposta[0];
if (Array.isArray(resposta)) resposta = resposta[0];


if (resposta && resposta.status === "sucesso") {
setUsuario({ id_usuario: resposta.id_usuario || resposta.id || null, usuario: usuarioInput });
return { sucesso: true, mensagem: resposta.mensagem };
}


return { sucesso: false, mensagem: resposta?.mensagem || "Credenciais inválidas" };
} catch (err) {
console.error("Erro no login:", err);
return { sucesso: false, mensagem: "Erro de conexão" };
}
};


const logout = () => setUsuario(null);


return <AuthContext.Provider value={{ usuario, login, logout }}>{children}</AuthContext.Provider>;
};