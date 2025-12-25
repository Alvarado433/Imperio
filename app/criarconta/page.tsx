'use client';

import useUsuario from "@/hooks/Usuario/useusuario";
import { useState } from "react";

export default function Cadastro() {
  const { criarUsuario, loading, error } = useUsuario();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");

  const [mensagem, setMensagem] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem("");

    if (!nome || !email || !senha) {
      setMensagem("Nome, email e senha são obrigatórios.");
      return;
    }

    const dados = {
      nome,
      email,
      senha,
      telefone: telefone || null,
      cpf: cpf || null,
      nivelid: 1 // nível do usuário: 1 = sistema
    };

    const novoUsuario = await criarUsuario(dados);

    if (novoUsuario) {
      setMensagem(
        `Usuário criado com sucesso! ID: ${novoUsuario.id_usuario} | PIN gerado automaticamente.`
      );
      setNome("");
      setEmail("");
      setSenha("");
      setTelefone("");
      setCpf("");
    } else {
      setMensagem("Erro ao criar usuário.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Cadastro de Usuário</h1>

      {mensagem && (
        <div className="mb-4 p-2 bg-blue-100 text-blue-800 rounded">{mensagem}</div>
      )}

      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          className="p-2 border rounded"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="p-2 border rounded"
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          className="p-2 border rounded"
        />

        <input
          type="text"
          placeholder="Telefone"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          className="p-2 border rounded"
        />

        <input
          type="text"
          placeholder="CPF"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          className="p-2 border rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {loading ? "Cadastrando..." : "Cadastrar"}
        </button>
      </form>
    </div>
  );
}
