"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/Api/conectar";

interface TipoCupom {
  id_tipo: number;
  nome: string;
  codigo: "percentual" | "valor" | "frete";
}

export default function NovoCupomPage() {
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

  /* =========================
     TIPO SELECIONADO
  ========================= */
  const tipoSelecionado = tipos.find(
    (t) => String(t.id_tipo) === String(form.tipo_id)
  );

  /* =========================
     LOG SELEÇÃO DE TIPO
  ========================= */
  useEffect(() => {
    if (tipoSelecionado) {
      console.log("🟢 Tipo selecionado:", tipoSelecionado);
    }
  }, [tipoSelecionado]);

  /* =========================
     GERAR CÓDIGO
  ========================= */
  function gerarCodigo(prefixo = "PROMO") {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let codigo = "";

    for (let i = 0; i < 6; i++) {
      codigo += chars[Math.floor(Math.random() * chars.length)];
    }

    const final = `${prefixo}-${codigo}`;

    console.log("🎲 Código gerado:", final);

    setForm((prev) => ({
      ...prev,
      codigo: final,
    }));
  }

  /* =========================
     CARREGAR TIPOS
  ========================= */
  useEffect(() => {
    async function carregarTipos() {
      console.log("📡 Buscando tipos de cupom...");

      try {
        const res = await api.get("/admin/cupom/tipos", {
          withCredentials: true,
        });

        console.log("✅ Resposta tipos:", res.data);

        if (Array.isArray(res.data?.dados)) {
          setTipos(res.data.dados);
        } else {
          console.warn("⚠️ dados não é array");
          setTipos([]);
        }
      } catch (error) {
        console.error("❌ Erro ao carregar tipos", error);
        setTipos([]);
      } finally {
        setLoadingTipos(false);
      }
    }

    carregarTipos();
  }, []);

  /* =========================
     AJUSTE DESCONTO FRETE
  ========================= */
  useEffect(() => {
    if (tipoSelecionado?.codigo === "frete") {
      setForm((prev) => ({ ...prev, desconto: "0" }));
    }
  }, [tipoSelecionado]);

  /* =========================
     HANDLE CHANGE
  ========================= */
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  /* =========================
     SALVAR CUPOM
  ========================= */
  async function salvar(e: React.FormEvent) {
    e.preventDefault();

    console.log("📤 Enviando cupom:", form);

    if (!form.codigo || !form.tipo_id) {
      alert("Preencha código e tipo do cupom");
      return;
    }

    if (
      tipoSelecionado?.codigo !== "frete" &&
      (!form.desconto || Number(form.desconto) <= 0)
    ) {
      alert("Informe um desconto válido");
      return;
    }

    setSalvando(true);

    try {
      const res = await api.post("/admin/cupons/criar", form, {
        withCredentials: true,
      });

      console.log("✅ Cupom criado:", res.data);

      alert("Cupom criado com sucesso!");
      router.push("/admin/cupons");
    } catch (error) {
      console.error("❌ Erro ao criar cupom", error);
      alert("Erro ao criar cupom");
    } finally {
      setSalvando(false);
    }
  }

  /* =========================
     UI
  ========================= */
  return (
    <div className="cupom-wrapper">
      <div className="cupom-card">
        <h3>🎟 Criar Cupom</h3>

        {loadingTipos ? (
          <p className="loading">Carregando tipos de cupom...</p>
        ) : (
          <>
            {/* PREVIEW */}
            <div className="preview">
              <span className="preview-label">Preview do cupom</span>
              <h4>{form.codigo || "SEU-CUPOM"}</h4>

              <p>
                {tipoSelecionado?.codigo === "percentual" &&
                  `${form.desconto || 0}% de desconto`}
                {tipoSelecionado?.codigo === "valor" &&
                  `R$ ${form.desconto || 0} OFF`}
                {tipoSelecionado?.codigo === "frete" &&
                  "🚚 Frete grátis"}
              </p>

              <small>
                {form.descricao || "Descrição do cupom"}
              </small>
            </div>

            <form onSubmit={salvar}>
              {/* CÓDIGO */}
              <label>Código do cupom</label>
              <div className="codigo-box">
                <input
                  name="codigo"
                  value={form.codigo}
                  onChange={handleChange}
                  required
                />
                <button type="button" onClick={() => gerarCodigo()}>
                  Gerar
                </button>
              </div>

              {/* GRID */}
              <div className="grid">
                <div>
                  <label>Tipo de cupom</label>
                  <select
                    name="tipo_id"
                    value={form.tipo_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecione</option>
                    {tipos.map((t) => (
                      <option key={t.id_tipo} value={t.id_tipo}>
                        {t.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label>Desconto</label>
                  <input
                    name="desconto"
                    type="number"
                    disabled={tipoSelecionado?.codigo === "frete"}
                    value={form.desconto}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <label>Descrição</label>
              <input
                name="descricao"
                onChange={handleChange}
              />

              <div className="actions">
                <button type="button" onClick={() => router.back()}>
                  Cancelar
                </button>
                <button type="submit" disabled={salvando}>
                  {salvando ? "Salvando..." : "Criar cupom"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>

      {/* ================= CSS ================= */}
      <style jsx global>{`
        .cupom-wrapper {
          display: flex;
          justify-content: center;
          padding: 40px;
        }

        .cupom-card {
          background: #fff;
          padding: 36px;
          border-radius: 20px;
          max-width: 900px;
          width: 100%;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.08);
        }

        .preview {
          background: linear-gradient(135deg, #2563eb, #1e40af);
          color: #fff;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 30px;
        }

        .preview-label {
          font-size: 12px;
          opacity: 0.8;
        }

        .preview h4 {
          margin: 8px 0;
          font-size: 22px;
        }

        .preview small {
          opacity: 0.9;
        }

        label {
          font-weight: 600;
          margin-bottom: 6px;
          display: block;
        }

        input,
        select {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          border: 1px solid #ddd;
          margin-bottom: 16px;
        }

        .codigo-box {
          display: flex;
          gap: 10px;
        }

        .codigo-box button {
          background: #2563eb;
          color: #fff;
          padding: 0 22px;
          border-radius: 10px;
          border: none;
          font-weight: 600;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
        }

        .actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
        }

        .actions button:last-child {
          background: #16a34a;
          color: #fff;
        }
      `}</style>
    </div>
  );
}
