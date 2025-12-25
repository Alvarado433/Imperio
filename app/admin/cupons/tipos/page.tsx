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
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    fetchTipos();
  }, []);

  const fetchTipos = async () => {
    try {
      const res = await api.get("/admin/cupom/tipos");
      setTipos(res.data.dados || []);
    } catch (err: any) {
      console.error(err);
      setError("Erro ao carregar tipos de cupom.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/admin/cupom/tipo/${editId}`, { nome, codigo, descricao, statusid: 1 });
      } else {
        await api.post("/admin/cupom/criar", { nome, codigo, descricao, statusid: 1 });
      }
      setShowPanel(false);
      setNome("");
      setCodigo("");
      setDescricao("");
      setEditId(null);
      fetchTipos();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar tipo de cupom.");
    }
  };

  if (loading) return <p>Carregando tipos de cupom...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container mt-4 position-relative">
      <style>
        {`
          .offcanvas-custom {
            position: fixed;
            top: 0;
            right: 0;
            width: 350px;
            max-width: 100%;
            height: 100%;
            background: #fff;
            box-shadow: -4px 0 12px rgba(0,0,0,0.2);
            transform: translateX(100%);
            transition: transform 0.3s ease-in-out;
            z-index: 1100;
            padding: 20px;
          }
          .offcanvas-custom.show {
            transform: translateX(0);
          }
          .backdrop-custom {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 1050;
          }
          .card-hover:hover {
            transform: translateY(-4px);
            transition: all 0.2s;
          }
        `}
      </style>

      <h1 className="mb-4">Tipos de Cupom</h1>

      {tipos.length === 0 ? (
        <p>Nenhum tipo de cupom encontrado.</p>
      ) : (
        <div className="row g-3">
          {tipos.map(tipo => (
            <div key={tipo.id_tipo} className="col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm card-hover border-primary">
                <div className="card-body d-flex flex-column justify-content-between">
                  <div>
                    <h5 className="card-title">{tipo.nome}</h5>
                    <h6 className="card-subtitle mb-2 text-muted">{tipo.codigo}</h6>
                    <p className="card-text">{tipo.descricao || "Sem descrição"}</p>
                  </div>
                  <div className="mt-3 d-flex justify-content-between align-items-center">
                    <span
                      className={`badge ${tipo.statusid === 1 ? 'bg-success' : 'bg-secondary'}`}
                    >
                      {tipo.statusid === 1 ? 'Ativo' : 'Inativo'}
                    </span>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => {
                        setNome(tipo.nome);
                        setCodigo(tipo.codigo);
                        setDescricao(tipo.descricao);
                        setEditId(tipo.id_tipo);
                        setShowPanel(true);
                      }}
                    >
                      Editar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Botão flutuante */}
      <button
        className="btn btn-primary position-fixed"
        style={{ top: '100px', right: '20px', zIndex: 1101 }}
        onClick={() => {
          setNome("");
          setCodigo("");
          setDescricao("");
          setEditId(null);
          setShowPanel(true);
        }}
      >
        + Adicionar Tipo
      </button>

      {/* Painel lateral */}
      <div className={`offcanvas-custom ${showPanel ? 'show' : ''}`}>
        <h5>{editId ? "Editar Tipo" : "Adicionar Tipo de Cupom"}</h5>
        <hr />
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Nome</label>
            <input
              type="text"
              className="form-control"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Código</label>
            <input
              type="text"
              className="form-control"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Descrição</label>
            <textarea
              className="form-control"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>
          <div className="d-flex justify-content-end">
            <button type="button" className="btn btn-secondary me-2" onClick={() => setShowPanel(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Salvar</button>
          </div>
        </form>
      </div>

      {/* Backdrop */}
      {showPanel && <div className="backdrop-custom" onClick={() => setShowPanel(false)}></div>}
    </div>
  );
}
