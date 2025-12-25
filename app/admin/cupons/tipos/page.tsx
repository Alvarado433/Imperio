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
    carregarTipos();
  }, []);

  const carregarTipos = async () => {
    try {
      const res = await api.get("/admin/cupom/tipos");
      setTipos(res.data.dados || []);
    } catch {
      setError("Erro ao carregar tipos de cupom.");
    } finally {
      setLoading(false);
    }
  };

  const salvarTipo = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/admin/cupom/tipos/criar", {
        nome,
        codigo,
        descricao,
        statusid: 1
      });

      setShowPanel(false);
      setNome("");
      setCodigo("");
      setDescricao("");
      carregarTipos();
    } catch {
      alert("Erro ao salvar tipo de cupom");
    }
  };

  if (loading) return <div className="text-center mt-5">Carregando...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container py-4">

      {/* ESTILO */}
      <style>{`
        body {
          background: #f5f6fa;
        }
        .page-title {
          font-weight: 600;
          letter-spacing: .5px;
        }
        .card-tipo {
          border: none;
          border-radius: 14px;
          transition: all .25s ease;
          background: #fff;
        }
        .card-tipo:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(0,0,0,.08);
        }
        .badge-ativo {
          background: #198754;
        }
        .fab {
          position: fixed;
          right: 25px;
          bottom: 25px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          font-size: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1060;
        }
        .offcanvas-admin {
          position: fixed;
          top: 0;
          right: 0;
          width: 380px;
          height: 100%;
          background: #fff;
          box-shadow: -6px 0 25px rgba(0,0,0,.15);
          transform: translateX(100%);
          transition: transform .3s ease;
          z-index: 1055;
          padding: 24px;
        }
        .offcanvas-admin.show {
          transform: translateX(0);
        }
        .offcanvas-header {
          font-weight: 600;
          font-size: 1.2rem;
        }
        .backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,.35);
          z-index: 1050;
        }
      `}</style>

      {/* TÍTULO */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="page-title">Tipos de Cupom</h2>
      </div>

      {/* LISTAGEM */}
      {tipos.length === 0 ? (
        <div className="alert alert-light text-center">
          Nenhum tipo de cupom cadastrado
        </div>
      ) : (
        <div className="row g-4">
          {tipos.map(tipo => (
            <div key={tipo.id_tipo} className="col-md-4">
              <div className="card card-tipo p-3 h-100">
                <div className="d-flex justify-content-between">
                  <div>
                    <h5 className="mb-1">{tipo.nome}</h5>
                    <small className="text-muted">{tipo.codigo}</small>
                  </div>
                  <span className={`badge ${tipo.statusid === 1 ? 'badge-ativo' : 'bg-secondary'}`}>
                    {tipo.statusid === 1 ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <p className="mt-3 text-muted">
                  {tipo.descricao || "Sem descrição"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* BOTÃO FLUTUANTE */}
      <button
        className="btn btn-primary fab"
        onClick={() => setShowPanel(true)}
      >
        +
      </button>

      {/* PAINEL LATERAL */}
      <div className={`offcanvas-admin ${showPanel ? 'show' : ''}`}>
        <div className="offcanvas-header mb-3">
          Novo Tipo de Cupom
        </div>
        <form onSubmit={salvarTipo}>
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

          <div className="d-flex justify-content-end gap-2 mt-4">
            <button
              type="button"
              className="btn btn-outline-secondary"
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

      {showPanel && <div className="backdrop" onClick={() => setShowPanel(false)} />}
    </div>
  );
}
