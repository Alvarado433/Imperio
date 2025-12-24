'use client';

import { useEffect, useState } from 'react';
import api from '@/Api/conectar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Produto {
  id_produto: number;
  nome: string;
  preco: number;
  estoque: number;
  catalogo: number;
  categoria_nome?: string;
  slug?: string;
  imagem?: string;
}

const getImagemUrl = (caminho?: string) => {
  if (!caminho) return undefined;
  const base = api.defaults.baseURL || '';
  return `${base}${caminho.replace(/^\/+/, '')}`;
};

export default function CatalogoPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 9;

  const fetchProdutos = async () => {
    try {
      const res = await api.get('/admin/produtos/catalogo');
      setProdutos(res.data.dados || []);
    } catch {
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, []);

  const toggleCatalogo = async (produto: Produto) => {
    try {
      if (produto.catalogo === 6) {
        await api.put(`/admin/produtos/${produto.id_produto}/catalogo/sim`);
        toast.success('Publicado no catálogo');
      } else {
        await api.put(`/admin/produtos/${produto.id_produto}/catalogo/nao`);
        toast.success('Removido do catálogo');
      }
      fetchProdutos();
    } catch {
      toast.error('Erro ao atualizar catálogo');
    }
  };

  const verProduto = (produto: Produto) => {
    if (!produto.slug) return toast.info('Produto sem página');
    window.open(`/produto/${produto.slug}`, '_blank');
  };

  const totalPaginas = Math.ceil(produtos.length / itensPorPagina);
  const produtosPagina = produtos.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  if (loading) return <div className="p-4">Carregando...</div>;

  return (
    <div className="catalogo-bg container-fluid py-4">
      <ToastContainer />

      <h1 className="page-title">Gestão de Catálogo</h1>
      <p className="page-subtitle">Publicação de produtos no site</p>

      {produtos.length === 0 ? (
        <p className="text-center text-muted">Nenhum produto encontrado</p>
      ) : (
        <>
          <div className="row g-4 mt-2">
            {produtosPagina.map(produto => (
              <div key={produto.id_produto} className="col-12 col-md-6 col-xl-4">
                <div className="produto-card">

                  {/* IMAGEM */}
                  <div className="img-wrapper">
                    {produto.imagem ? (
                      <img src={getImagemUrl(produto.imagem)} alt={produto.nome} />
                    ) : (
                      <span className="img-placeholder">Sem imagem</span>
                    )}

                    <span
                      className={`status-badge ${
                        produto.catalogo === 5 ? 'on' : 'off'
                      }`}
                    >
                      {produto.catalogo === 5 ? 'Publicado' : 'Oculto'}
                    </span>
                  </div>

                  {/* CONTEÚDO */}
                  <div className="card-content">
                    <h5>{produto.nome}</h5>

                    <span className="categoria">
                      {produto.categoria_nome || 'Sem categoria'}
                    </span>

                    <div className="info">
                      <span>
                        Preço
                        <strong>R$ {Number(produto.preco).toFixed(2)}</strong>
                      </span>
                      <span>
                        Estoque
                        <strong>{produto.estoque}</strong>
                      </span>
                    </div>

                    <div className="acoes">
                      <button
                        className={`btn ${
                          produto.catalogo === 6 ? 'btn-success' : 'btn-danger'
                        }`}
                        onClick={() => toggleCatalogo(produto)}
                      >
                        {produto.catalogo === 6 ? 'Publicar' : 'Remover'}
                      </button>

                      <button
                        className="btn btn-outline"
                        onClick={() => verProduto(produto)}
                      >
                        Ver Página
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* PAGINAÇÃO */}
          {totalPaginas > 1 && (
            <nav className="mt-4 d-flex justify-content-center">
              <ul className="pagination">
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(p => (
                  <li key={p} className={`page-item ${p === paginaAtual ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setPaginaAtual(p)}>
                      {p}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </>
      )}

      {/* ===== ESTILO GLOBAL ===== */}
      <style jsx global>{`
        .catalogo-bg {
          background: #f5f6fa;
          min-height: 100vh;
        }

        .page-title {
          font-weight: 700;
          color: #2c2f33;
        }

        .page-subtitle {
          color: #8a8f98;
          margin-bottom: 6px;
        }

        .produto-card {
          background: #fff;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 12px 30px rgba(0,0,0,.08);
          transition: transform .25s;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .produto-card:hover {
          transform: translateY(-6px);
        }

        .img-wrapper {
          position: relative;
          height: 220px;
          background: #eef0f4;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .img-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .img-placeholder {
          color: #9aa0a6;
          font-weight: 500;
        }

        .status-badge {
          position: absolute;
          top: 14px;
          right: 14px;
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 700;
          color: #fff;
        }

        .status-badge.on {
          background: #22c55e;
        }

        .status-badge.off {
          background: #ef4444;
        }

        .card-content {
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex-grow: 1;
        }

        .card-content h5 {
          font-weight: 700;
          color: #2c2f33;
          margin: 0;
        }

        .categoria {
          font-size: 0.75rem;
          background: #e8ecf3;
          color: #4b5563;
          padding: 4px 10px;
          border-radius: 999px;
          width: fit-content;
          font-weight: 600;
        }

        .info {
          display: flex;
          justify-content: space-between;
          margin-top: 8px;
          font-size: 0.85rem;
          color: #6b7280;
        }

        .info strong {
          display: block;
          color: #111827;
          font-size: 0.95rem;
        }

        .acoes {
          display: flex;
          gap: 10px;
          margin-top: auto;
        }

        .btn {
          flex: 1;
          padding: 10px;
          border-radius: 10px;
          font-weight: 600;
          transition: all .2s;
        }

        .btn-success {
          background: #22c55e;
          color: #fff;
          border: none;
        }

        .btn-danger {
          background: #ef4444;
          color: #fff;
          border: none;
        }

        .btn-outline {
          border: 2px solid #d1d5db;
          background: transparent;
        }

        .btn:hover {
          transform: scale(1.03);
        }
      `}</style>
    </div>
  );
}
