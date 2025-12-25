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
     LOG
  ========================= */
  const log = (msg: string, data?: any) =>
    console.log(`🟣 [CUPOM] ${msg}`, data ?? "");

  /* =========================
     TIPO SELECIONADO
  ========================= */
  const tipoSelecionado = tipos.find(
    (t) => String(t.id_tipo) === String(form.tipo_id)
  );

  /* =========================
     GERAR CÓDIGO
  ========================= */
  function gerarCodigo(tipo?: TipoCupom["codigo"]) {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let random = "";

    for (let i = 0; i < 6; i++) {
      random += chars[Math.floor(Math.random() * chars.length)];
    }

    let prefixo = "PROMO";
    if (tipo === "percentual") prefixo = "OFF";
    if (tipo === "valor") prefixo = "SAVE";
    if (tipo === "frete") prefixo = "FRETE";

    setForm((prev) => ({
      ...prev,
      codigo: `${prefixo}-${random}`,
    }));
  }

  /* =========================
     CARREGAR TIPOS
  ========================= */
  useEffect(() => {
    async function carregarTipos() {
      try {
        log("Buscando tipos");
        const res = await api.get("/admin/cupom/tipos", {
          withCredentials: true,
        });

        setTipos(res.data?.dados || []);
        log("Tipos carregados", res.data?.dados);
      } catch (e) {
        console.error("Erro ao carregar tipos", e);
      } finally {
        setLoadingTipos(false);
      }
    }

    carregarTipos();
    gerarCodigo(); // 🔥 gera automaticamente ao abrir
  }, []);

  /* =========================
     AJUSTES AUTOMÁTICOS
  ========================= */
  useEffect(() => {
    if (tipoSelecionado) {
      gerarCodigo(tipoSelecionado.codigo);

      if (tipoSelecionado.codigo === "frete") {
        setForm((p) => ({ ...p, desconto: "0" }));
      }
    }
  }, [form.tipo_id]);

  /* =========================
     CHANGE
  ========================= */
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  /* =========================
     SALVAR
  ========================= */
  async function salvar(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      codigo: form.codigo,
      tipo_id: Number(form.tipo_id),
      desconto:
        tipoSelecionado?.codigo === "frete"
          ? 0
          : Number(form.desconto),
      valor_minimo: Number(form.valor_minimo) || 0,
      limite_uso: form.limite_uso ? Number(form.limite_uso) : null,
      inicio: form.inicio || null,
      expiracao: form.expiracao || null,
      descricao: form.descricao || "",
      statusid: 1,
    };

    log("Payload", payload);

    try {
      setSalvando(true);
      await api.post("/admin/cupom/criar", payload, {
        withCredentials: true,
      });
      alert("✅ Cupom criado!");
      router.push("/admin/cupons");
    } catch (e) {
      console.error(e);
      alert("Erro ao criar cupom");
    } finally {
      setSalvando(false);
    }
  }

  /* =========================
     UI
  ========================= */
  return (
    <div className="wrapper">
      <div className="card">
        <h2>🎟 Criar Cupom</h2>

        <form onSubmit={salvar}>
          <label>Código do cupom</label>
          <div className="codigo">
            <input value={form.codigo} disabled />
            <button type="button" onClick={() => gerarCodigo(tipoSelecionado?.codigo)}>
              🔄 Gerar novo
            </button>
          </div>

          <div className="grid">
            <div>
              <label>Tipo</label>
              <select name="tipo_id" value={form.tipo_id} onChange={handleChange} required>
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
                step="0.01"
                disabled={tipoSelecionado?.codigo === "frete"}
                onChange={handleChange}
                value={form.desconto}
              />
            </div>

            <div>
              <label>Valor mínimo</label>
              <input name="valor_minimo" type="number" step="0.01" onChange={handleChange} />
            </div>

            <div>
              <label>Limite de uso</label>
              <input name="limite_uso" type="number" onChange={handleChange} />
            </div>

            <div>
              <label>Início</label>
              <input name="inicio" type="date" onChange={handleChange} />
            </div>

            <div>
              <label>Expiração</label>
              <input name="expiracao" type="date" onChange={handleChange} />
            </div>
          </div>

          <label>Descrição</label>
          <input name="descricao" onChange={handleChange} />

          <button className="submit" disabled={salvando}>
            {salvando ? "Salvando..." : "Criar cupom"}
          </button>
        </form>
      </div>

      {/* PREVIEW PREMIUM */}
      <div className="preview">
        <span className="badge">{tipoSelecionado?.nome || "Tipo"}</span>
        <h1>
          {tipoSelecionado?.codigo === "percentual" && `${form.desconto || 0}%`}
          {tipoSelecionado?.codigo === "valor" && `R$ ${form.desconto || 0}`}
          {tipoSelecionado?.codigo === "frete" && "Frete Grátis"}
        </h1>
        <strong>{form.codigo}</strong>
        <p>{form.descricao || "Descrição do cupom"}</p>
        <small>
          Válido: {form.inicio || "--"} até {form.expiracao || "--"}
        </small>
        <small>
          Mínimo R$ {form.valor_minimo || 0} • Limite {form.limite_uso || "∞"}
        </small>
      </div>

      <style jsx>{`
        .wrapper {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 32px;
          padding: 40px;
        }
        .card,
        .preview {
          background: #fff;
          padding: 28px;
          border-radius: 20px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
        }
        .codigo {
          display: flex;
          gap: 8px;
        }
        .codigo input {
          flex: 1;
          background: #f3f4f6;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }
        .submit {
          margin-top: 20px;
          width: 100%;
          padding: 14px;
          font-weight: bold;
        }
        .preview {
          text-align: center;
          background: linear-gradient(135deg, #2563eb, #1e40af);
          color: #fff;
        }
        .badge {
          background: rgba(255,255,255,.2);
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 12px;
        }
        .preview h1 {
          font-size: 48px;
          margin: 12px 0;
        }
      `}</style>
    </div>
  );
}
