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
     LOG HELPER
  ========================= */
  function log(label: string, data?: any) {
    console.log(`🟣 [CUPOM] ${label}`, data ?? "");
  }

  /* =========================
     TIPO SELECIONADO
  ========================= */
  const tipoSelecionado = tipos.find(
    (t) => String(t.id_tipo) === String(form.tipo_id)
  );

  /* =========================
     GERAR CÓDIGO
  ========================= */
  function gerarCodigo() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let codigo = "";
    for (let i = 0; i < 6; i++) {
      codigo += chars[Math.floor(Math.random() * chars.length)];
    }

    setForm((prev) => ({ ...prev, codigo: `PROMO-${codigo}` }));
  }

  /* =========================
     CARREGAR TIPOS
  ========================= */
  useEffect(() => {
    async function carregarTipos() {
      try {
        log("Buscando tipos de cupom");
        const res = await api.get("/admin/cupom/tipos", {
          withCredentials: true,
        });

        log("Resposta tipos", res.data);
        setTipos(res.data?.dados || []);
      } catch (err) {
        console.error("❌ Erro ao carregar tipos", err);
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
     SALVAR
  ========================= */
  async function salvar(e: React.FormEvent) {
    e.preventDefault();

    if (!form.codigo || !form.tipo_id) {
      alert("Código e tipo são obrigatórios");
      return;
    }

    if (
      tipoSelecionado?.codigo !== "frete" &&
      Number(form.desconto) <= 0
    ) {
      alert("Desconto inválido");
      return;
    }

    if (form.inicio && form.expiracao) {
      if (new Date(form.expiracao) < new Date(form.inicio)) {
        alert("Expiração deve ser maior que início");
        return;
      }
    }

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
      limite_uso: form.limite_uso
        ? Number(form.limite_uso)
        : null,
      inicio: form.inicio || null,
      expiracao: form.expiracao || null,
      descricao: form.descricao || "",
      statusid: 1,
    };

    log("Payload enviado", payload);

    try {
      setSalvando(true);
      await api.post("/admin/cupom/criar", payload, {
        withCredentials: true,
      });

      alert("✅ Cupom criado com sucesso!");
      router.push("/admin/cupons");
    } catch (err) {
      console.error("❌ Erro ao criar cupom", err);
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
          <label>Código</label>
          <div className="codigo">
            <input name="codigo" value={form.codigo} onChange={handleChange} />
            <button type="button" onClick={gerarCodigo}>
              Gerar
            </button>
          </div>

          <div className="grid">
            <div>
              <label>Tipo</label>
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
                step="0.01"
                disabled={tipoSelecionado?.codigo === "frete"}
                value={form.desconto}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Valor mínimo</label>
              <input
                name="valor_minimo"
                type="number"
                step="0.01"
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Limite de uso</label>
              <input
                name="limite_uso"
                type="number"
                onChange={handleChange}
              />
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
        <h3>Preview do Cupom</h3>
        <strong>{form.codigo || "CÓDIGO"}</strong>
        <p>
          {tipoSelecionado?.codigo === "percentual" &&
            `${form.desconto || 0}% OFF`}
          {tipoSelecionado?.codigo === "valor" &&
            `R$ ${form.desconto || 0} OFF`}
          {tipoSelecionado?.codigo === "frete" && "Frete Grátis"}
        </p>
        <small>
          Válido de {form.inicio || "—"} até {form.expiracao || "—"}
        </small>
        <small>
          Mínimo: R$ {form.valor_minimo || 0} | Limite:{" "}
          {form.limite_uso || "∞"}
        </small>
      </div>

      <style jsx>{`
        .wrapper {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
          padding: 40px;
        }
        .card,
        .preview {
          background: #fff;
          padding: 24px;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
        }
        .codigo {
          display: flex;
          gap: 8px;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
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
