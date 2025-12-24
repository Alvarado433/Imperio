"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/Api/conectar";

interface TipoCupom {
  id_tipo: number;
  nome: string;
  codigo: string; // percentual | valor | frete
}

export default function NovoCupomPage() {
  const router = useRouter();

  const [tipos, setTipos] = useState<TipoCupom[]>([]);
  const [loading, setLoading] = useState(false);

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

  const tipoSelecionado = tipos.find(
    (t) => String(t.id_tipo) === String(form.tipo_id)
  );

  /* 🔹 GERAR CÓDIGO AUTOMÁTICO */
  function gerarCodigo(prefixo = "CUPOM") {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let codigo = "";

    for (let i = 0; i < 6; i++) {
      codigo += chars[Math.floor(Math.random() * chars.length)];
    }

    return `${prefixo}-${codigo}`;
  }

  /* 🔹 CARREGAR TIPOS */
  useEffect(() => {
    async function carregarTipos() {
      try {
        const res = await api.get("/admin/cupons/tipos", {
          withCredentials: true,
        });

        setTipos(Array.isArray(res.data?.dados) ? res.data.dados : []);
      } catch {
        setTipos([]);
      }
    }

    carregarTipos();
  }, []);

  /* 🔹 AJUSTAR DESCONTO AUTOMATICAMENTE */
  useEffect(() => {
    if (tipoSelecionado?.codigo === "frete") {
      setForm((prev) => ({ ...prev, desconto: "0" }));
    }
  }, [tipoSelecionado]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();

    if (!form.codigo || !form.tipo_id) {
      alert("Preencha código e tipo");
      return;
    }

    if (
      tipoSelecionado?.codigo !== "frete" &&
      (!form.desconto || Number(form.desconto) <= 0)
    ) {
      alert("Informe um desconto válido");
      return;
    }

    setLoading(true);

    try {
      await api.post("/admin/cupons/criar", form, {
        withCredentials: true,
      });

      alert("Cupom criado com sucesso!");
      router.push("/admin/cupons");
    } catch {
      alert("Erro ao criar cupom");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="cupom-wrapper">
      <div className="cupom-card">
        <h3>🎟 Criar Cupom</h3>

        <form onSubmit={salvar}>
          {/* CÓDIGO */}
          <label>Código</label>
          <div className="codigo-box">
            <input
              name="codigo"
              value={form.codigo}
              placeholder="EX: PROMO10"
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="gerar-btn"
              onClick={() =>
                setForm((p) => ({
                  ...p,
                  codigo: gerarCodigo("PROMO"),
                }))
              }
            >
              Gerar
            </button>
          </div>

          {/* GRID */}
          <div className="grid">
            <div>
              <label>Tipo de Cupom</label>
              <select name="tipo_id" required onChange={handleChange}>
                <option value="">Selecione</option>
                {tipos.map((t) => (
                  <option key={t.id_tipo} value={t.id_tipo}>
                    {t.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>
                Desconto{" "}
                {tipoSelecionado?.codigo === "percentual" && "(%)"}
                {tipoSelecionado?.codigo === "valor" && "(R$)"}
                {tipoSelecionado?.codigo === "frete" && "(Frete grátis)"}
              </label>

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
              <input
                name="inicio"
                type="date"
                required
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Expiração</label>
              <input
                name="expiracao"
                type="date"
                required
                onChange={handleChange}
              />
            </div>
          </div>

          <label>Descrição</label>
          <input
            name="descricao"
            placeholder="Ex: Cupom de boas-vindas"
            onChange={handleChange}
          />

          <div className="actions">
            <button type="button" onClick={() => router.back()}>
              Cancelar
            </button>
            <button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Criar Cupom"}
            </button>
          </div>
        </form>
      </div>

      {/* 🎨 CSS GLOBAL */}
      <style jsx global>{`
        .cupom-wrapper {
          display: flex;
          justify-content: center;
          padding: 40px;
        }

        .cupom-card {
          background: #fff;
          padding: 32px;
          border-radius: 18px;
          max-width: 900px;
          width: 100%;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.08);
        }

        h3 {
          margin-bottom: 24px;
          font-weight: 700;
        }

        label {
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 6px;
          display: block;
        }

        input,
        select {
          width: 100%;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid #ddd;
          margin-bottom: 16px;
        }

        .codigo-box {
          display: flex;
          gap: 10px;
          margin-bottom: 16px;
        }

        .gerar-btn {
          background: #2563eb;
          color: #fff;
          padding: 0 20px;
          border-radius: 10px;
          border: none;
          font-weight: 600;
          cursor: pointer;
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
          margin-top: 20px;
        }

        button {
          padding: 12px 22px;
          border-radius: 10px;
          border: none;
          font-weight: 600;
          cursor: pointer;
        }

        button:first-child {
          background: #e5e7eb;
        }

        button:last-child {
          background: #16a34a;
          color: #fff;
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
