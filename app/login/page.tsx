"use client";

import { useState } from "react";
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

  const handleCadastro = async () => {
    if (!nome || !email || !senha) {
      toast.error("Nome, email e senha são obrigatórios.");
      return;
    }

    try {
      const res = await api.post("/usuarios", {
        nome,
        email,
        senha,
        telefone,
        cpf,
      });

      if (res.status === 201 || res.status === 200) {
        toast.success("Usuário criado com sucesso!");
        setStep("login");
        setNome(""); setEmail(""); setSenha(""); setTelefone(""); setCpf("");
      } else {
        toast.error(res.data.mensagem || "Erro ao criar usuário.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.mensagem || "Erro de conexão.");
    }
  };

  if (loading) return <p className="text-white text-center mt-5">Carregando...</p>;

  return (
    <>
      <ToastContainer position="top-right" autoClose={4000} />

      <div className="login-bg">
        {/* ================== TELA INICIAL ================== */}
        {step === "inicio" && (
          <div className="login-container animate-slideIn">
            <img src={config?.logo} alt="Logo" className="logo-login" />
            <h1>{config?.titulo}</h1>
            {config?.mensagem_personalizada && <p className="message">{config.mensagem_personalizada}</p>}
            <button className="btn-primary" onClick={() => setStep("login")}>Entrar</button>
          </div>
        )}

        {/* ================== LOGIN ================== */}
        {step === "login" && (
          <div className="login-container animate-slideIn">
            <img src={config?.logo} alt="Logo" className="logo-login" />
            <h1>Login</h1>
            {errorMsg && <p className="error-msg">{errorMsg}</p>}

            <div className="input-wrapper">
              <div className="input-icon"><FaUser /></div>
              <input type="text" placeholder="Usuário ou Email" value={usuario} onChange={e => setUsuario(e.target.value)} />
            </div>

            <div className="input-wrapper">
              <div className="input-icon"><FaLock /></div>
              <input type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} />
            </div>

            <button className="btn-primary" onClick={() => handleLogin(usuario, senha)}>
              {loadingBtn ? <div className="spinner"></div> : "Entrar"}
            </button>

            <div className="links">
              <a href="#">Esqueci minha senha</a>
              <button className="voltar" onClick={() => setStep("cadastro")}>Criar conta</button>
            </div>
          </div>
        )}

        {/* ================== PIN ================== */}
        {step === "pin" && (
          <div className="login-container animate-slideIn">
            <img src={config?.logo} alt="Logo" className="logo-login" />
            <h1>Digite o PIN</h1>
            {errorMsg && <p className="error-msg">{errorMsg}</p>}

            <div className="input-wrapper">
              <div className="input-icon"><FaKey /></div>
              <input type="password" maxLength={6} value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ""))} placeholder="••••" />
            </div>

            <button className="btn-primary" onClick={() => handleValidarPin(pin)} disabled={pin.length < 4}>
              {loadingBtn ? <div className="spinner"></div> : "Validar PIN"}
            </button>

            <button className="voltar" onClick={() => setStep("login")}>Voltar</button>
          </div>
        )}

        {/* ================== CADASTRO ================== */}
        {step === "cadastro" && (
          <div className="login-container animate-slideIn">
            <img src={config?.logo} alt="Logo" className="logo-login" />
            <h1>Criar Conta</h1>

            <div className="input-wrapper">
              <div className="input-icon"><FaUser /></div>
              <input type="text" placeholder="Nome completo" value={nome} onChange={e => setNome(e.target.value)} />
            </div>

            <div className="input-wrapper">
              <div className="input-icon"><FaEnvelope /></div>
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            <div className="input-wrapper">
              <div className="input-icon"><FaLock /></div>
              <input type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} />
            </div>

            <div className="input-wrapper">
              <div className="input-icon"><FaPhone /></div>
              <input type="text" placeholder="Telefone" value={telefone} onChange={e => setTelefone(e.target.value)} />
            </div>

            <div className="input-wrapper">
              <div className="input-icon"><FaKey /></div>
              <input type="text" placeholder="CPF" value={cpf} onChange={e => setCpf(e.target.value)} />
            </div>

            <button className="btn-primary" onClick={handleCadastro}>
              {loadingBtn ? <div className="spinner"></div> : "Criar Conta"}
            </button>

            <button className="voltar" onClick={() => setStep("login")}>Voltar</button>
          </div>
        )}
      </div>

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
          background: radial-gradient(circle at 25% 25%, rgba(255,90,95,0.05), transparent),
                      radial-gradient(circle at 75% 75%, rgba(0,150,255,0.05), transparent);
          animation: rotateBG 30s linear infinite;
          z-index: 0;
        }

        @keyframes rotateBG { 0% { transform: rotate(0deg) scale(1); } 50% { transform: rotate(180deg) scale(1.05); } 100% { transform: rotate(360deg) scale(1); } }

        .login-container {
          position: relative; z-index: 1;
          width: 100%; max-width: 400px;
          padding: 50px 30px; display: flex; flex-direction: column; align-items: center;
          background: rgba(0,0,0,0.5); border-radius: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.6);
          backdrop-filter: blur(15px); color: #fff; text-align: center;
          animation: fadeIn 0.8s ease-in-out;
        }

        .animate-slideIn { animation: slideIn 0.5s ease-out; }

        @keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }

        .logo-login { width: 120px; margin-bottom: 25px; }

        h1 { font-size: 2rem; font-weight: 700;
          background: linear-gradient(90deg,#ff758c,#2f3c95); -webkit-background-clip:text; -webkit-text-fill-color:transparent;
        }

        .input-wrapper {
          width: 100%; display: flex; align-items: center; padding: 12px 15px;
          margin-bottom: 15px; border-radius: 12px; background: rgba(255,255,255,0.05);
          border: 2px solid #444; transition: 0.3s;
        }

        .input-wrapper:focus-within { border-color: #6c63ff; background: rgba(255,255,255,0.1); }

        .input-icon { margin-right: 10px; color: #aaa; font-size: 1.2rem; }

        .input-wrapper input {
          flex: 1; background: transparent; border: none; outline: none; color: #fff; font-size: 1rem;
        }
        .input-wrapper input::placeholder { color: #aaa; }

        .btn-primary {
          width: 100%; padding: 14px; margin-top: 10px;
          border: none; border-radius: 12px; font-size: 1.1rem; font-weight: 600;
          color: #fff; cursor: pointer; display: flex; justify-content:center; align-items:center;
          background: linear-gradient(90deg,#ff758c,#2f3c95); box-shadow: 0 6px 20px rgba(0,0,0,0.5); transition: 0.3s;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.6); }

        .voltar { margin-top: 10px; border:1px solid #fff; border-radius:8px; width:100%; padding:10px 0; cursor:pointer; background:none; color:#fff; }
        .voltar:hover { background: rgba(255,255,255,0.1); }

        .spinner { width: 18px; height:18px; border:3px solid rgba(255,255,255,0.3); border-top:3px solid #fff; border-radius:50%; animation:spin 1s linear infinite; margin-right:8px; }

        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        .links { margin-top:15px; display:flex; justify-content:space-between; width:100%; }
        .links a { color:#aaa; font-size:0.9rem; text-decoration:none; }
        .links a:hover { color:#fff; }

        .error-msg { color:#ff6b6b; font-weight:500; margin-bottom:10px; }

        @media(max-width:480px){ .login-container{ padding:40px 20px;} h1{ font-size:1.6rem;} .links{ flex-direction:column; gap:10px; align-items:center;} }
      `}</style>
    </>
  );
}
