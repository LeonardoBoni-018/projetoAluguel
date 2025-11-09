import React, { createContext, useState, useEffect } from "react";
import { api } from "../services/api"; // <-- usa o axios configurado
// certifique-se de ter criado src/services/api.js

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);

  // ✅ manter login entre recarregamentos
  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("usuario");
    if (usuarioSalvo) {
      setUsuario(JSON.parse(usuarioSalvo));
    }
  }, []);

  // ✅ salvar no localStorage sempre que mudar
  useEffect(() => {
    if (usuario) {
      localStorage.setItem("usuario", JSON.stringify(usuario));
    } else {
      localStorage.removeItem("usuario");
    }
  }, [usuario]);

  // 🔐 login com chamada ao backend (porta 5000)
  const login = async (usuarioInput, senhaInput) => {
    try {
      const res = await api.post("/auth/login", {
        usuario: usuarioInput,
        senha: senhaInput,
      });

      // o MySQL via Node retorna [ [ [dados] ] ], então pegamos o primeiro item válido
      const resposta =
        res.data && Array.isArray(res.data)
          ? res.data[0] && res.data[0][0]
          : res.data;

      console.log("Resposta login:", resposta);

      if (resposta && resposta.status === "sucesso") {
        const userData = {
          id_usuario: resposta.id_usuario || resposta.id || null,
          usuario: usuarioInput,
        };
        setUsuario(userData);
        return { sucesso: true, mensagem: resposta.mensagem };
      } else {
        return { sucesso: false, mensagem: resposta?.mensagem || "Falha no login" };
      }
    } catch (err) {
      console.error("Erro login:", err);
      return { sucesso: false, mensagem: "Erro ao conectar ao servidor" };
    }
  };

  const logout = () => {
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
