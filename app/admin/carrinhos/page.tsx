'use client';

import { useEffect, useState } from "react";
import api from "@/Api/conectar";
import Link from "next/link";

// Função para gerar URL completa da imagem
export const getImagemUrl = (caminho?: string) => {
  if (!caminho) return undefined;
  const base = api.defaults.baseURL || "";
  const caminhoLimpo = caminho.replace(/^\/+/, "");
  const baseFinal = base.endsWith("/") ? base : `${base}/`;
  return `${baseFinal}${caminhoLimpo}`;
};

interface CarrinhoItem {
  id_item: number;
  produto_id: number;
  nome_produto: string;
  imagem: string | null;
  quantidade: number;
  preco_unitario: number | string | null;
}

interface Carrinho {
  id_carrinho: number;
  usuario_id: number;
  usuario_nome?: string; // nome do usuário
  criado: string;
  itens: CarrinhoItem[];
}

export default function CarrinhosPage() {
  const [carrinhos, setCarrinhos] = useState<Carrinho[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCarrinhos = async () => {
      try {
        const res = await api.get("/admin/carrinho"); // rota do DashboardController
        const dados: Carrinho[] = (res.data.dados || []).map((c: any) => ({
          ...c,
          usuario_nome: c.usuario_nome || `ID ${c.usuario_id}`,
          itens: c.itens?.map((i: any) => ({
            ...i,
            preco_unitario: Number(i.preco_unitario) || 0
          })) || []
        }));
        setCarrinhos(dados);
      } catch (err: any) {
        console.error(err);
        setError("Erro ao carregar carrinhos.");
      } finally {
        setLoading(false);
      }
    };
    fetchCarrinhos();
  }, []);

  if (loading) return <p>Carregando carrinhos...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Carrinhos</h1>

      {carrinhos.length === 0 ? (
        <p>Nenhum carrinho encontrado.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle text-center">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Usuário</th>
                <th>Qtd. Itens</th>
                <th>Criado em</th>
                <th>Itens</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {carrinhos.map((c) => (
                <tr key={c.id_carrinho}>
                  <td>{c.id_carrinho}</td>
                  <td>{c.usuario_nome}</td>
                  <td>{c.itens?.reduce((acc, item) => acc + item.quantidade, 0) || 0}</td>
                  <td>{new Date(c.criado).toLocaleString()}</td>
                  <td className="text-start">
                    {c.itens?.length ? (
                      c.itens.map(item => (
                        <div key={item.id_item} className="d-flex align-items-center mb-2">
                          <img
                            src={getImagemUrl(item.imagem ?? undefined) || "/placeholder.png"}
                            alt={item.nome_produto}
                            style={{ width: 50, height: 50, objectFit: "cover", marginRight: 10 }}
                          />
                          <div>
                            <p className="mb-0 fw-bold">{item.nome_produto}</p>
                            <small>Qtd: {item.quantidade} - R$ {(Number(item.preco_unitario) || 0).toFixed(2)}</small>
                          </div>
                        </div>
                      ))
                    ) : (
                      <span className="text-muted">Sem itens</span>
                    )}
                  </td>
                  <td>
                    <Link href={`/admin/carrinhos/${c.id_carrinho}`} className="btn btn-sm btn-primary">
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
