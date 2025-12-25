'use client';

import { useEffect, useState } from "react";
import api from "@/Api/conectar"; // sua instância axios/fetch
import Link from "next/link";

interface Carrinho {
  id_carrinho: number;
  usuario_id: number;
  criado: string;
  itens: { produto_id: number; quantidade: number }[];
}

export default function CarrinhosPage() {
  const [carrinhos, setCarrinhos] = useState<Carrinho[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCarrinhos = async () => {
      try {
        const res = await api.get("/carrinho");
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
              <th className="border p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {carrinhos.map((c) => (
              <tr key={c.id_carrinho} className="text-center">
                <td className="border p-2">{c.id_carrinho}</td>
                <td className="border p-2">{c.usuario_id}</td>
                <td className="border p-2">{c.itens?.reduce((acc, item) => acc + item.quantidade, 0) || 0}</td>
                <td className="border p-2">{new Date(c.criado).toLocaleString()}</td>
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
