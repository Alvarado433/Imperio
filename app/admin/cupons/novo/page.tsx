"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/Api/conectar";

/* =======================
   TIPOS
======================= */
interface TipoCupom {
  id_tipo: number;
  nome: string;
  codigo: "percentual" | "valor" | "frete";
}

/* =======================
   COMPONENTE
======================= */
export default function CriarCupomPage() {
  const router = useRouter();

  const [tipos, setTipos] = useState<TipoCupom[]>([]);
  const [loadingTipos, setLoadingTipos] = useState(true);
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
    statusid: 1,
  });

  /* =======================
     TIPO SELECIONADO
  ======================= */
  const tipoSelecionado = tipos.find(
    (t) => String(t.id_tipo) === String(form.tipo_id)
  );

  /* =======================
     LOG FORM (DEBUG)
  ======================= */
  useEffect(() => {
    console.log("📝 FORM ATUAL:", form);
  }, [form]);

  /* =======================
     CARREGAR TIPOS
  ======================= */
  useEffect(() => {
    async function carregarTipos() {
      try {
        console.log("📡 GET /admin/cupom/tipos");
        const res = await api.get("/admin/cupom/tipos", {
          withCredentials: true,
        });

        console.log("✅ TIPOS RECEBIDOS:", res.data);
        setTipos(res.data?.dados || []);
      } catch (err) {
        console.error("❌ Erro ao carregar tipos", err);
      } finally {
        setLoadingTipos(false);
      }
    }

    carregarTipos();
  }, []);

  /* =======================
     AJUSTE AUTOMÁTICO
  ======================= */
  useEffect(() => {
    if (tipoSelecionado?.codigo === "frete") {
      setForm((prev) => ({ ...prev, desconto: "0" }));
    }
  }, [tipoSelecionado]);

  /* =======================
     GERAR CÓDIGO
  ======================= */
  function gerarCodigo() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let cod = "";

    for (let i = 0; i < 6; i++) {
      cod += chars[Math.floor(Math.random() * chars.length)];
    }

    setForm((prev) => ({
      ...prev,
      codigo: `PROMO-${cod}`,
    }));
  }

  /* =======================
     HANDLE CHANGE
  ======================= */
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  /* =======================
     SALVAR
  ======================= */
  async function salvar(e: React.FormEvent) {
    e.preventDefault();

    console.log("📤 ENVIANDO CUPOM:", form);

    try {
      setSalvando(true);

      await api.post("/admin/cupom/criar", form, {
        withCredentials: true,
      });

      console.log("✅ CUPOM CRIADO COM SUCESSO");
      alert("Cupom criado com sucesso!");
      router.push("/admin/cupons");
    } catch (err) {
      console.error("❌ ERRO AO CRIAR CUPOM", err);
      alert("Erro ao criar cupom");
    } finally {
      setSalvando(false);
    }
  }

  /* =======================
     PREVIEW TEXTO
  ======================= */
  function textoPreview() {
    if (!tipoSelecionado) return "Selecione um tipo";

    if (tipoSelecionado.codigo === "percentual")
      return `${form.desconto || 0}% OFF`;

    if (tipoSelecionado.codigo === "valor")
      return `R$ ${form.desconto || 0} OFF`;

    return "FRETE GRÁTIS 🚚";
  }

  /* =======================
     UI
  ======================= */
  return (
    <div className="container">
      {/* FORM */}
      <div className="card">
        <h2>Criar Cupom</h2>

        {loadingTipos ? (
          <p>Carregando tipos...</p>
        ) : (
          <form onSubmit={salvar}>
            <label>Código</label>
            <div className="codigo">
              <input name="codigo" value={form.codigo} onChange={handleChange} />
              <button type="button" onClick={gerarCodigo}>
                Gerar
              </button>
            </div>

            <label>Tipo</label>
            <select name="tipo_id" onChange={handleChange} required>
              <option value="">Selecione</option>
              {tipos.map((t) => (
                <option key={t.id_tipo} value={t.id_tipo}>
                  {t.nome}
                </option>
              ))}
            </select>

            <label>Desconto</label>
            <input
              name="desconto"
              type="number"
              disabled={tipoSelecionado?.codigo === "frete"}
              onChange={handleChange}
            />

            <label>Descrição</label>
            <input name="descricao" onChange={handleChange} />

            <button type="submit" disabled={salvando}>
              {salvando ? "Salvando..." : "Criar cupom"}
            </button>
          </form>
        )}
      </div>

      {/* PREVIEW */}
      <div className="preview">
        <h3>Preview do Cupom</h3>

        <div className="cupom">
          <span className="badge">{textoPreview()}</span>
          <h4>{form.codigo || "PROMO-XXXX"}</h4>
          <p>{form.descricao || "Descrição do cupom"}</p>
          <small>
            Válido até: {form.expiracao || "DD/MM/AAAA"}
          </small>
        </div>
      </div>

      {/* CSS */}
      <style jsx>{`
        .container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          padding: 40px;
        }

        .card,
        .preview {
          background: #fff;
          padding: 32px;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
        }

        label {
          font-weight: 600;
          display: block;
          margin-top: 12px;
        }

        input,
        select {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          border: 1px solid #ddd;
          margin-top: 6px;
        }

        .codigo {
          display: flex;
          gap: 8px;
        }

        button {
          margin-top: 20px;
          padding: 12px;
          border-radius: 10px;
          border: none;
          background: #2563eb;
          color: #fff;
          font-weight: 600;
        }

        .cupom {
          border: 2px dashed #2563eb;
          padding: 24px;
          border-radius: 16px;
          text-align: center;
        }

        .badge {
          background: #2563eb;
          color: #fff;
          padding: 6px 14px;
          border-radius: 999px;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}
