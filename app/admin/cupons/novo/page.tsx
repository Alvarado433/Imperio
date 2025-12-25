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
     GERAR CÓDIGO
  ========================= */
  function gerarCodigo(prefixo = "PROMO") {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let codigo = "";

    for (let i = 0; i < 6; i++) {
      codigo += chars[Math.floor(Math.random() * chars.length)];
    }

    setForm((prev) => ({
      ...prev,
      codigo: `${prefixo}-${codigo}`,
    }));
  }

  /* =========================
     CARREGAR TIPOS (ROTA CERTA)
  ========================= */
  useEffect(() => {
    async function carregarTipos() {
      try {
        const res = await api.get("/admin/cupom/tipos", {
          withCredentials: true,
        });

        if (Array.isArray(res.data?.dados)) {
          setTipos(res.data.dados);
        } else {
          setTipos([]);
        }
      } catch (error) {
        console.error("Erro ao carregar tipos", error);
        setTipos([]);
      } finally {
        setLoadingTipos(false);
      }
    }

    carregarTipos();
  }, []);

  /* =========================
     AJUSTAR DESCONTO AUTOMÁTICO
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
      await api.post("/admin/cupons/criar", form, {
        withCredentials: true,
      });

      alert("Cupom criado com sucesso!");
      router.push("/admin/cupons");
    } catch (error) {
      console.error(error);
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
          <form onSubmit={salvar}>
            {/* CÓDIGO */}
            <label>Código do cupom</label>
            <div className="codigo-box">
              <input
                name="codigo"
                value={form.codigo}
                placeholder="EX: PROMO10"
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
              <button type="submit" disabled={salvando}>
                {salvando ? "Salvando..." : "Criar cupom"}
              </button>
            </div>
          </form>
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
          max-width: 960px;
          width: 100%;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.08);
        }

        h3 {
          margin-bottom: 28px;
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

        input:disabled {
          background: #f3f4f6;
        }

        .codigo-box {
          display: flex;
          gap: 10px;
          margin-bottom: 16px;
        }

        .codigo-box button {
          background: #2563eb;
          color: #fff;
          padding: 0 22px;
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
          margin-top: 24px;
        }

        .actions button {
          padding: 12px 24px;
          border-radius: 10px;
          border: none;
          font-weight: 600;
          cursor: pointer;
        }

        .actions button:first-child {
          background: #e5e7eb;
        }

        .actions button:last-child {
          background: #16a34a;
          color: #fff;
        }

        .actions button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .loading {
          padding: 20px;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
}
