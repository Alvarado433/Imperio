'use client';

import { useEffect, useState } from 'react';
import api from '@/Api/conectar';

interface Menu {
  id_menu?: number;
  nome: string;
  icone: string;
  rota: string;
}

export default function GerenciarMenuPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);

  async function carregarMenus() {
    try {
      console.log('📂 Carregando menus...');
      const res = await api.get('/admin/menu', { withCredentials: true });
      setMenus(res.data?.dados ?? []);
    } catch (e) {
      console.error('❌ Erro ao carregar menus', e);
      setMenus([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarMenus();
  }, []);

  return (
    <div className="page">
      <header className="header">
        <h1>📂 Gerenciar Menu</h1>
        <button className="btn">+ Novo Menu</button>
      </header>

      {loading ? (
        <p className="info">Carregando menus...</p>
      ) : menus.length === 0 ? (
        <p className="info">Nenhum menu cadastrado</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Ícone</th>
              <th>Rota</th>
            </tr>
          </thead>
          <tbody>
            {menus.map((menu, i) => (
              <tr key={i}>
                <td>{menu.nome}</td>
                <td>{menu.icone}</td>
                <td>{menu.rota}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <style jsx>{`
        .page {
          padding: 32px;
          background: #f5f7fa;
          min-height: 100vh;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        h1 {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
        }

        .btn {
          background: #2563eb;
          color: #fff;
          border: none;
          padding: 10px 16px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
        }

        .info {
          text-align: center;
          color: #6b7280;
          margin-top: 40px;
        }

        .table {
          width: 100%;
          border-collapse: collapse;
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
        }

        th,
        td {
          padding: 14px 16px;
          border-bottom: 1px solid #e5e7eb;
          text-align: left;
        }

        th {
          background: #f9fafb;
          font-size: 14px;
          font-weight: 700;
          color: #374151;
        }

        td {
          font-size: 14px;
          color: #111827;
        }

        tr:last-child td {
          border-bottom: none;
        }
      `}</style>
    </div>
  );
}
