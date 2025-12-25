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
     GERAR CÓDIGO
  ========================= */
  function gerarCodigo(prefixo = "PROMO") {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return `${prefixo}-${code}`;
  }

  /* =========================
     TIPO SELECIONADO
  ========================= */
  const tipoSelecionado = tipos.find(
    (t) => String(t.id_tipo) === String(form.tipo_id)
  );

  /* =========================
     AUTO GERAR AO ABRIR
  ========================= */
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      codigo: gerarCodigo(),
    }));
  }, []);

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
        log("Tipos recebidos", res.data);
        setTipos(res.data?.dados || []);
      } catch (e) {
        console.error("Erro tipos", e);
      } finally {
        setLoadingTipos(false);
      }
    }
    carregarTipos();
  }, []);

  /* =========================
     AJUSTE AUTOMÁTICO
  ========================= */
  useEffect(() => {
    if (!tipoSelecionado) return;

    if (tipoSelecionado.codigo === "frete") {
      setForm((p) => ({ ...p, desconto: "0" }));
    }

    // muda prefixo conforme tipo
    const prefix =
      tipoSelecionado.codigo === "frete"
        ? "FRETE"
        : tipoSelecionado.codigo === "valor"
        ? "VALE"
        : "PROMO";

    setForm((p) => ({ ...p, codigo: gerarCodigo(prefix) }));
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
          : parseFloat(form.desconto),
      valor_minimo: form.valor_minimo
        ? parseFloat(form.valor_minimo)
        : 0,
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
    <div className="layout">
      {/* FORM */}
      <div className="card">
        <h2>🎟 Criar Cupom</h2>

        <form onSubmit={salvar}>
          <label>Código</label>
          <div className="codigo-box">
            <input name="codigo" value={form.codigo} readOnly />
            <button type="button" onClick={() => setForm(p => ({
              ...p,
              codigo: gerarCodigo()
            }))}>
              🔄
            </button>
          </div>

          <div className="grid">
            <div>
              <label>Tipo</label>
              <select name="tipo_id" onChange={handleChange} required>
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
            {salvando ? "Salvando..." : "Criar Cupom"}
          </button>
        </form>
      </div>

      {/* PREVIEW */}
      <div className="preview">
        <span className="badge">{tipoSelecionado?.nome || "Cupom"}</span>
        <h1>
          {tipoSelecionado?.codigo === "percentual" && `${form.desconto || 0}%`}
          {tipoSelecionado?.codigo === "valor" && `R$ ${form.desconto || 0}`}
          {tipoSelecionado?.codigo === "frete" && "Frete Grátis"}
        </h1>
        <strong>{form.codigo}</strong>
        <p>{form.descricao || "Descrição do cupom"}</p>
        <small>
          Válido de {form.inicio || "--"} até {form.expiracao || "--"}
        </small>
      </div>

      <style jsx>{`
        .layout {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 28px;
          padding: 40px;
        }
        .card, .preview {
          background: #fff;
          border-radius: 18px;
          padding: 28px;
          box-shadow: 0 20px 50px rgba(0,0,0,.08);
        }
        .preview {
          background: linear-gradient(135deg,#2563eb,#1e40af);
          color: #fff;
          text-align: center;
        }
        .badge {
          background: rgba(255,255,255,.2);
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 13px;
        }
        h1 {
          font-size: 48px;
          margin: 20px 0;
        }
        .codigo-box {
          display: flex;
          gap: 8px;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(2,1fr);
          gap: 12px;
        }
        input, select {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          border: 1px solid #ddd;
        }
        button {
          background: #2563eb;
          color: #fff;
          border: none;
          padding: 10px 16px;
          border-radius: 10px;
          cursor: pointer;
        }
        .submit {
          margin-top: 20px;
          width: 100%;
        }
      `}</style>
    </div>
  );
}
