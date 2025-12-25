"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/Api/conectar";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface TipoCupom {
  id_tipo: number;
  nome: string;
  codigo: "percentual" | "valor" | "frete";
}

export default function NovoCupomPage() {
  const router = useRouter();

  const [tipos, setTipos] = useState<TipoCupom[]>([]);
  const [salvando, setSalvando] = useState(false);

  const [form, setForm] = useState({
    codigo: "",
    descricao: "",
    tipo_id: "",
    desconto: "",
    valor_minimo: "",
    limite_uso: "",
    inicio: "",
    expiracao: "",
  });

  const tipoSelecionado = tipos.find(
    (t) => String(t.id_tipo) === String(form.tipo_id)
  );

  /* =========================
     LOAD TIPOS
  ========================= */
  useEffect(() => {
    api
      .get("/admin/cupom/tipos", { withCredentials: true })
      .then((res) => setTipos(res.data?.dados || []))
      .catch(() => toast.error("Erro ao carregar tipos"));
  }, []);

  /* =========================
     AUTO AJUSTE
  ========================= */
  useEffect(() => {
    if (tipoSelecionado?.codigo === "frete") {
      setForm((prev) => ({ ...prev, desconto: "0" }));
    }
  }, [tipoSelecionado]);

  /* =========================
     HELPERS
  ========================= */
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function gerarCodigo() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const random = Array.from({ length: 6 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join("");

    setForm((prev) => ({ ...prev, codigo: `PROMO-${random}` }));
    toast.info("Código gerado automaticamente");
  }

  /* =========================
     SALVAR
  ========================= */
  async function salvar(e: React.FormEvent) {
    e.preventDefault();

    if (!form.codigo || !form.tipo_id) {
      toast.warning("Código e tipo são obrigatórios");
      return;
    }

    if (
      tipoSelecionado?.codigo !== "frete" &&
      Number(form.desconto) <= 0
    ) {
      toast.warning("Desconto inválido");
      return;
    }

    if (
      form.inicio &&
      form.expiracao &&
      new Date(form.expiracao) < new Date(form.inicio)
    ) {
      toast.warning("Expiração deve ser maior que início");
      return;
    }

    const payload = {
      codigo: form.codigo,
      tipo_id: Number(form.tipo_id),
      desconto:
        tipoSelecionado?.codigo === "frete"
          ? 0
          : parseFloat(form.desconto),
      valor_minimo: Number(form.valor_minimo) || 0,
      limite_uso: form.limite_uso ? Number(form.limite_uso) : null,
      inicio: form.inicio || null,
      expiracao: form.expiracao || null,
      descricao: form.descricao || "",
      statusid: 1,
    };

    try {
      setSalvando(true);
      await api.post("/admin/cupom/criar", payload, {
        withCredentials: true,
      });
      toast.success("Cupom criado com sucesso!");
      setTimeout(() => router.push("/admin/cupons"), 1200);
    } catch {
      toast.error("Erro ao criar cupom");
    } finally {
      setSalvando(false);
    }
  }

  /* =========================
     UI
  ========================= */
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="page">
        {/* FORM */}
        <div className="card">
          <h1>Criar Cupom</h1>
          <p className="subtitle">
            Configure descontos, validade e regras do cupom
          </p>

          <form onSubmit={salvar}>
            <div className="field">
              <label>Código do cupom</label>
              <div className="inline">
                <input
                  name="codigo"
                  value={form.codigo}
                  onChange={handleChange}
                  placeholder="PROMO-XXXX"
                />
                <button type="button" onClick={gerarCodigo}>
                  Gerar
                </button>
              </div>
            </div>

            <div className="grid">
              <div className="field">
                <label>Tipo</label>
                <select
                  name="tipo_id"
                  value={form.tipo_id}
                  onChange={handleChange}
                >
                  <option value="">Selecione</option>
                  {tipos.map((t) => (
                    <option key={t.id_tipo} value={t.id_tipo}>
                      {t.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>
                  Desconto{" "}
                  {tipoSelecionado?.codigo === "percentual" && "(%)"}
                  {tipoSelecionado?.codigo === "valor" && "(R$)"}
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="desconto"
                  disabled={tipoSelecionado?.codigo === "frete"}
                  value={form.desconto}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label>Valor mínimo</label>
                <input
                  type="number"
                  step="0.01"
                  name="valor_minimo"
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label>Limite de uso</label>
                <input
                  type="number"
                  name="limite_uso"
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label>Início</label>
                <input type="date" name="inicio" onChange={handleChange} />
              </div>

              <div className="field">
                <label>Expiração</label>
                <input
                  type="date"
                  name="expiracao"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="field">
              <label>Descrição</label>
              <input name="descricao" onChange={handleChange} />
            </div>

            <button className="primary" disabled={salvando}>
              {salvando ? "Salvando..." : "Criar Cupom"}
            </button>
          </form>
        </div>

        {/* PREVIEW */}
        <div className="preview">
          <span className="badge">PREVIEW</span>
          <h2>{form.codigo || "CÓDIGO"}</h2>

          <strong>
            {tipoSelecionado?.codigo === "percentual" &&
              `${form.desconto || 0}% OFF`}
            {tipoSelecionado?.codigo === "valor" &&
              `R$ ${form.desconto || 0} OFF`}
            {tipoSelecionado?.codigo === "frete" && "🚚 Frete Grátis"}
          </strong>

          <p>
            Válido de <b>{form.inicio || "—"}</b> até{" "}
            <b>{form.expiracao || "—"}</b>
          </p>

          <small>
            Pedido mínimo: R$ {form.valor_minimo || 0} <br />
            Limite de uso: {form.limite_uso || "Ilimitado"}
          </small>
        </div>
      </div>

      {/* STYLES */}
      <style jsx>{`
        .page {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 32px;
          padding: 40px;
          background: #f5f7fb;
          min-height: 100vh;
        }

        .card {
          background: #fff;
          padding: 32px;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
        }

        h1 {
          font-size: 26px;
          margin-bottom: 4px;
        }

        .subtitle {
          color: #64748b;
          margin-bottom: 24px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        label {
          font-weight: 600;
          font-size: 14px;
        }

        input,
        select {
          padding: 12px;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 16px;
        }

        .inline {
          display: flex;
          gap: 8px;
        }

        button {
          padding: 12px 18px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
        }

        .primary {
          width: 100%;
          background: linear-gradient(135deg, #2563eb, #1e40af);
          color: white;
          font-weight: bold;
          margin-top: 24px;
        }

        .preview {
          background: linear-gradient(135deg, #1e293b, #0f172a);
          color: white;
          padding: 32px;
          border-radius: 20px;
          position: relative;
        }

        .badge {
          position: absolute;
          top: 16px;
          right: 16px;
          background: #22c55e;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: bold;
        }

        .preview h2 {
          font-size: 28px;
          margin-bottom: 12px;
        }

        .preview strong {
          font-size: 22px;
          display: block;
          margin-bottom: 12px;
        }

        .preview p {
          margin-bottom: 8px;
        }

        .preview small {
          color: #cbd5f5;
        }
      `}</style>
    </>
  );
}
