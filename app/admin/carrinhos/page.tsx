'use client';

import { useEffect, useState } from "react";
import api from "@/Api/conectar";
import Link from "next/link";

interface CarrinhoItem {
  id_item: number;
  produto_id: number;
  nome_produto: string;
  imagem: string;
  quantidade: number;
  preco_unitario: number | string | null;
}

interface Carrinho {
  id_carrinho: number;
  usuario_id: number;
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
        setCarrinhos(res.data.dados || []);
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
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Carrinhos</h1>

      {carrinhos.length === 0 ? (
        <p>Nenhum carrinho encontrado.</p>
      ) : (
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">ID</th>
              <th className="border p-2">Usuário</th>
              <th className="border p-2">Qtd. Itens</th>
              <th className="border p-2">Criado em</th>
              <th className="border p-2">Itens</th>
              <th className="border p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {carrinhos.map((c) => (
              <tr key={c.id_carrinho} className="text-center align-top">
                <td className="border p-2">{c.id_carrinho}</td>
                <td className="border p-2">{c.usuario_id}</td>
                <td className="border p-2">
                  {c.itens?.reduce((acc, item) => acc + item.quantidade, 0) || 0}
                </td>
                <td className="border p-2">{new Date(c.criado).toLocaleString()}</td>
                <td className="border p-2 text-left">
                  {c.itens?.map(item => (
                    <div key={item.id_item} className="flex items-center gap-2 mb-1">
                      <img
                        src={item.imagem ? `/public/${item.imagem}` : "/placeholder.png"}
                        alt={item.nome_produto}
                        className="w-10 h-10 object-cover"
                      />
                      <div>
                        <p className="text-sm font-semibold">{item.nome_produto}</p>
                        <p className="text-xs">
                          Qtd: {item.quantidade} - R$ {(Number(item.preco_unitario) || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </td>
                <td className="border p-2">
                  <Link
                    href={`/admin/carrinhos/${c.id_carrinho}`}
                    className="text-blue-600 hover:underline"
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
