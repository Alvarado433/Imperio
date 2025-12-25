"use client";

import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaUser, FaLock, FaKey, FaEnvelope, FaPhone } from "react-icons/fa";
import { useLoginConfig } from "@/hooks/useLoginConfig";
import api from "@/Api/conectar";

export default function LoginPage() {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [pin, setPin] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");

  const {
    config,
    loading,
    step,
    setStep,
    loadingBtn,
    errorMsg,
    handleLogin,
    handleValidarPin,
  } = useLoginConfig();

  // ---- Limpa campos ao começar a carregar (barreira: nada pré-preenchido)
  useEffect(() => {
    if (loading) {
      setUsuario("");
      setSenha("");
      setPin("");
      setNome("");
      setEmail("");
      setTelefone("");
      setCpf("");
    }
  }, [loading]);

  // ---- Helper para bloquear colar/copiar em campos sensíveis
  const blockPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    toast.info("Colar bloqueado neste campo");
  };

  // ---- Validação simples antes de enviar cadastro (cliente)
  const handleCadastro = async () => {
    if (!nome.trim() || !email.trim() || !senha.trim()) {
      toast.error("Nome, email e senha são obrigatórios.");
      return;
    }

    try {
      // desabilita botão por segurança (hook também faz)
      // envia para backend usando axios (api)
      const res = await api.post("/usuarios", {
        nome: nome.trim(),
        email: email.trim(),
        senha,
        telefone: telefone.trim() || null,
        cpf: cpf.trim() || null,
      });

      if (res.status === 201 || res.status === 200) {
        toast.success("Usuário criado com sucesso!");
        setStep("login");
        // limpa
        setNome(""); setEmail(""); setSenha(""); setTelefone(""); setCpf("");
      } else {
        toast.error(res.data?.mensagem || "Erro ao criar usuário.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.mensagem || "Erro de conexão.");
    }
  };

  if (loading) return <p className="text-white text-center mt-5">Carregando...</p>;

  // Estado que bloqueia inputs globalmente: true quando carregando ou durante request
  const inputsDisabled = loading || loadingBtn;

  return (
    <>
      <ToastContainer position="top-right" autoClose={4000} />

      <div className="login-bg" aria-busy={loading}>
        {/* INÍCIO */}
        {step === "inicio" && (
          <div className="login-container">
            <img src={config?.logo} alt="Logo" className="logo-login" />
            <h1>{config?.titulo}</h1>
            {config?.mensagem_personalizada && <p className="message">{config.mensagem_personalizada}</p>}
            <button className="btn-primary" onClick={() => setStep("login")} disabled={inputsDisabled}>Entrar</button>
          </div>
        )}

        {/* LOGIN */}
        {step === "login" && (
          <div className="login-container">
            <img src={config?.logo} alt="Logo" className="logo-login" />
            <h1>Login</h1>
            {errorMsg && <p className="error-msg">{errorMsg}</p>}

            <div className="input-wrapper" aria-disabled={inputsDisabled}>
              <div className="input-icon"><FaUser /></div>
              <input
                autoComplete="off"
                spellCheck={false}
                type="text"
                placeholder="Usuário ou Email"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value.replace(/<[^>]*>?/gm, ""))}
                disabled={inputsDisabled}
                aria-disabled={inputsDisabled}
              />
            </div>

            <div className="input-wrapper" aria-disabled={inputsDisabled}>
              <div className="input-icon"><FaLock /></div>
              <input
                autoComplete="new-password"
                spellCheck={false}
                type="password"
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                onPaste={blockPaste}
                disabled={inputsDisabled}
                aria-disabled={inputsDisabled}
              />
            </div>

            <button
              className="btn-primary"
              onClick={() => handleLogin(usuario.trim(), senha)}
              disabled={inputsDisabled}
            >
              {loadingBtn ? <div className="spinner" /> : "Entrar"}
            </button>

            <div className="links">
              <a href="#">Esqueci minha senha</a>
              <button className="voltar" onClick={() => setStep("cadastro")} disabled={inputsDisabled}>Criar conta</button>
            </div>
          </div>
        )}

        {/* PIN */}
        {step === "pin" && (
          <div className="login-container">
            <img src={config?.logo} alt="Logo" className="logo-login" />
            <h1>Digite o PIN</h1>
            {errorMsg && <p className="error-msg">{errorMsg}</p>}

            <div className="input-wrapper">
              <div className="input-icon"><FaKey /></div>
              <input
                inputMode="numeric"
                autoComplete="off"
                type="password"
                maxLength={6}
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                onPaste={blockPaste}
                disabled={inputsDisabled}
                aria-disabled={inputsDisabled}
              />
            </div>

            <button className="btn-primary" onClick={() => handleValidarPin(pin)} disabled={inputsDisabled || pin.length < 4}>
              {loadingBtn ? <div className="spinner" /> : "Validar PIN"}
            </button>

            <button className="voltar" onClick={() => setStep("login")} disabled={inputsDisabled}>Voltar</button>
          </div>
        )}

        {/* CADASTRO */}
        {step === "cadastro" && (
          <div className="login-container">
            <img src={config?.logo} alt="Logo" className="logo-login" />
            <h1>Criar Conta</h1>

            <div className="input-wrapper"><div className="input-icon"><FaUser /></div>
              <input autoComplete="off" type="text" placeholder="Nome completo" value={nome} onChange={(e) => setNome(e.target.value.replace(/<[^>]*>?/gm, ""))} disabled={inputsDisabled} />
            </div>

            <div className="input-wrapper"><div className="input-icon"><FaEnvelope /></div>
              <input autoComplete="email" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={inputsDisabled} />
            </div>

            <div className="input-wrapper"><div className="input-icon"><FaLock /></div>
              <input autoComplete="new-password" type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} onPaste={blockPaste} disabled={inputsDisabled} />
            </div>

            <div className="input-wrapper"><div className="input-icon"><FaPhone /></div>
              <input inputMode="tel" autoComplete="tel" type="text" placeholder="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value.replace(/[^\d+\s()-]/g, ""))} disabled={inputsDisabled} />
            </div>

            <div className="input-wrapper"><div className="input-icon"><FaKey /></div>
              <input inputMode="numeric" autoComplete="off" type="text" placeholder="CPF" value={cpf} onChange={(e) => setCpf(e.target.value.replace(/\D/g, ""))} onPaste={blockPaste} disabled={inputsDisabled} />
            </div>

            <button className="btn-primary" onClick={handleCadastro} disabled={inputsDisabled}>
              {loadingBtn ? <div className="spinner" /> : "Criar Conta"}
            </button>

            <button className="voltar" onClick={() => setStep("login")} disabled={inputsDisabled}>Voltar</button>
          </div>
        )}
      </div>

      {/* CSS dentro do componente (mantive estilo moderno) */}
      <style jsx>{`
        html, body, .login-bg {
          margin: 0; padding: 0; height: 100vh; width: 100%;
          display: flex; justify-content: center; align-items: center;
          font-family: 'Segoe UI', sans-serif; position: relative;
          background: ${config?.fundo || "#0e0e0e"};
        }
        .login-bg::before {
          content: "";
          position: absolute; top: -50%; left: -50%;
          width: 200%; height: 200%;
          background: radial-gradient(circle at 25% 25%, rgba(255,90,95,0.04), transparent),
                      radial-gradient(circle at 75% 75%, rgba(0,150,255,0.03), transparent);
          animation: rotateBG 30s linear infinite; z-index: 0;
        }
        @keyframes rotateBG { 0% { transform: rotate(0deg) scale(1);} 50% { transform: rotate(180deg) scale(1.02);} 100% { transform: rotate(360deg) scale(1);} }
        .login-container { position: relative; z-index:1; width: 100%; max-width: 420px;
          padding: 48px 32px; display:flex; flex-direction:column; align-items:center;
          background: rgba(0,0,0,0.56); border-radius: 18px; box-shadow: 0 12px 40px rgba(0,0,0,0.6);
          backdrop-filter: blur(12px); color:#fff; }
        .logo-login { width: 110px; margin-bottom: 20px; }
        h1 { font-size: 1.9rem; font-weight:700; margin-bottom: 10px;
          background: linear-gradient(90deg,#ff758c,#2f3c95); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .input-wrapper { width:100%; display:flex; align-items:center; padding:12px 14px; margin-bottom:12px;
          border-radius:10px; background: rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.04); transition: 0.18s; }
        .input-wrapper:focus-within { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,0.6); border-color: #6c63ff; background: rgba(255,255,255,0.04); }
        .input-icon { color:#bfbfbf; margin-right:10px; }
        input { flex:1; background:transparent; border:none; outline:none; color:#fff; font-size:1rem; }
        input::placeholder { color:#9aa0ac; }
        .btn-primary { width:100%; padding:13px; border-radius:12px; border:none; background: linear-gradient(90deg,#ff758c,#2f3c95);
          color:#fff; font-weight:600; cursor:pointer; box-shadow: 0 8px 22px rgba(47,60,149,0.12); transition: 0.22s; display:flex; justify-content:center; align-items:center; }
        .btn-primary:disabled { opacity:0.6; cursor:not-allowed; transform:none; box-shadow:none; }
        .voltar { margin-top:10px; width:100%; padding:11px; border-radius:10px; border:1px solid rgba(255,255,255,0.12); background:transparent; color:#fff; cursor:pointer; }
        .spinner { width:18px; height:18px; border:3px solid rgba(255,255,255,0.25); border-top:3px solid #fff; border-radius:50%; animation:spin 1s linear infinite; margin-right:8px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .links { width:100%; display:flex; justify-content:space-between; margin-top:8px; }
        .links a { color:#bfbfbf; text-decoration:none; font-size:0.9rem; }
        .error-msg { color:#ff6b6b; margin-bottom:8px; }
        @media(max-width:480px){ .login-container{ padding:28px 18px;} h1{ font-size:1.4rem; } }
      `}</style>
    </>
  );
}
