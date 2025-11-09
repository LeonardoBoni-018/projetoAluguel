import React, { createContext, useState, useEffect } from "react";
import { api } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);

  // Carrega usuário do localStorage ao iniciar
  useEffect(() => {
    const u = localStorage.getItem("usuario");
    if (u) setUsuario(JSON.parse(u));
  }, []);

  // Atualiza localStorage sempre que o estado muda
  useEffect(() => {
    if (usuario) {
      localStorage.setItem("usuario", JSON.stringify(usuario));
    } else {
      localStorage.removeItem("usuario");
    }
  }, [usuario]);

  // Função de login
 const login = async (usuarioInput, senhaInput) => {
  try {
    const res = await api.post("/auth/login", {
      usuario: usuarioInput,
      senha: senhaInput,
    });

    let resposta = res.data;
    if (Array.isArray(resposta)) resposta = resposta[0];
    if (Array.isArray(resposta)) resposta = resposta[0];

    if (resposta && resposta.status === "sucesso") {
      setUsuario({
        id_usuario: resposta.id_usuario || resposta.id || null,
        usuario: usuarioInput,
      });
    }

    return {
      status: resposta?.status || "erro",
      mensagem: resposta?.mensagem || "Credenciais inválidas",
      id_usuario: resposta?.id_usuario || null,
    };
  } catch (err) {
    console.error("Erro no login:", err);
    return {
      status: "erro",
      mensagem: "Erro de conexão",
      id_usuario: null,
    };
  }
};


  // Função de logout
  const logout = () => {
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
