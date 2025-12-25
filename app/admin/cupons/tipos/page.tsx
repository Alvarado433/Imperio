'use client';

import { useEffect, useState } from "react";
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

  useEffect(() => {
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
    fetchTipos();
  }, []);

  if (loading) return <p>Carregando tipos de cupom...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Tipos de Cupom</h1>

      {tipos.length === 0 ? (
        <p>Nenhum tipo de cupom encontrado.</p>
      ) : (
        <div className="row g-3">
          {tipos.map(tipo => (
            <div key={tipo.id_tipo} className="col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{tipo.nome}</h5>
                  <h6 className="card-subtitle mb-2 text-muted">{tipo.codigo}</h6>
                  <p className="card-text">{tipo.descricao || "Sem descrição"}</p>
                </div>
                <div className="card-footer bg-white text-end">
                  <span
                    className={`badge ${tipo.statusid === 1 ? 'bg-success' : 'bg-secondary'}`}
                  >
                    {tipo.statusid === 1 ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
