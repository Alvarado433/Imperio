'use client';

import { useEffect, useState, FormEvent } from "react";
import api from "@/Api/conectar";

interface CupomTipo {
  id_tipo: number;
  nome: string;
  codigo: string;
  descricao: string;
  statusid: number;
}

export default function TiposCuponsPage() {
  const [tipos, setTipos] = useState<CupomTipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showPanel, setShowPanel] = useState(false);
  const [nome, setNome] = useState("");
  const [codigo, setCodigo] = useState("");
  const [descricao, setDescricao] = useState("");

  useEffect(() => {
    fetchTipos();
  }, []);

  const fetchTipos = async () => {
    try {
      const res = await api.get("/admin/cupom/tipos");
      setTipos(res.data.dados || []);
    } catch (err) {
      setError("Erro ao carregar tipos de cupom.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ SALVANDO NA ROTA CORRETA
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      await api.post("/admin/cupom/tipos/criar", {
        nome,
        codigo,
        descricao,
        statusid: 1,
      });

      setShowPanel(false);
      setNome("");
      setCodigo("");
      setDescricao("");

      fetchTipos();
    } catch (err) {
      console.error(err);
      alert("Erro ao criar tipo de cupom.");
    }
  };

  if (loading) return <p>Carregando tipos de cupom...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container mt-4 position-relative">

      {/* CSS INLINE */}
      <style>{`
        .offcanvas-custom {
          position: fixed;
          top: 0;
          right: 0;
          width: 360px;
          height: 100%;
          background: #fff;
          box-shadow: -4px 0 15px rgba(0,0,0,0.15);
          transform: translateX(100%);
          transition: transform .3s ease;
          z-index: 1055;
          padding: 20px;
        }
        .offcanvas-custom.show {
          transform: translateX(0);
        }
        .backdrop-custom {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,.4);
          z-index: 1050;
        }
      `}</style>

      <h1 className="mb-4">Tipos de Cupom</h1>

      {tipos.length === 0 ? (
        <p>Nenhum tipo de cupom encontrado.</p>
      ) : (
        <div className="row g-3">
          {tipos.map(tipo => (
            <div key={tipo.id_tipo} className="col-md-4">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h5>{tipo.nome}</h5>
                  <small className="text-muted">{tipo.codigo}</small>
                  <p className="mt-2">{tipo.descricao || "Sem descrição"}</p>
                  <span className={`badge ${tipo.statusid === 1 ? 'bg-success' : 'bg-secondary'}`}>
                    {tipo.statusid === 1 ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* BOTÃO FLUTUANTE */}
      <button
        className="btn btn-primary position-fixed"
        style={{ right: 20, bottom: 20, zIndex: 1060 }}
        onClick={() => setShowPanel(true)}
      >
        + Novo Tipo
      </button>

      {/* PAINEL LATERAL */}
      <div className={`offcanvas-custom ${showPanel ? "show" : ""}`}>
        <h5>Novo Tipo de Cupom</h5>
        <hr />

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Nome</label>
            <input
              className="form-control"
              value={nome}
              onChange={e => setNome(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Código</label>
            <input
              className="form-control"
              value={codigo}
              onChange={e => setCodigo(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Descrição</label>
            <textarea
              className="form-control"
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
            />
          </div>

          <div className="d-flex justify-content-end">
            <button
              type="button"
              className="btn btn-secondary me-2"
              onClick={() => setShowPanel(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Salvar
            </button>
          </div>
        </form>
      </div>

      {showPanel && <div className="backdrop-custom" onClick={() => setShowPanel(false)} />}
    </div>
  );
}
