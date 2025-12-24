'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/Api/conectar";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

interface Status {
  id_status: number;
  nome: string;
  codigo: string;
}

export default function NovoBannerPage() {
  const router = useRouter();

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [link, setLink] = useState("");
  const [imagem, setImagem] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<Status[]>([]);
  const [statusId, setStatusId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/admin/status").then(res => {
      setStatus(res.data.dados || []);
      const ativo = res.data.dados?.find((s: Status) => s.codigo === "ATIVO");
      if (ativo) setStatusId(ativo.id_status);
    });
  }, []);

  useEffect(() => {
    if (!imagem) return setPreview(null);
    const url = URL.createObjectURL(imagem);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imagem]);

  async function salvarBanner(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo || !imagem || !statusId) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.append("titulo", titulo);
      form.append("descricao", descricao);
      form.append("link", link);
      form.append("statusid", String(statusId));
      form.append("imagem", imagem);

      await api.post("/admin/banner/criar", form);
      toast.success("Banner criado");
      router.push("/admin/banners");
    } catch {
      toast.error("Erro ao salvar banner");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="painel-page">
      <ToastContainer />

      <div className="painel-header">
        <h1>Novo Banner</h1>
        <button onClick={() => router.back()}>Voltar</button>
      </div>

      <form onSubmit={salvarBanner} className="painel-grid">
        {/* FORM */}
        <div className="painel-card">
          <label>Título</label>
          <input value={titulo} onChange={e => setTitulo(e.target.value)} />

          <label>Descrição</label>
          <textarea
            rows={3}
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
          />

          <label>Link</label>
          <input
            placeholder="https://..."
            value={link}
            onChange={e => setLink(e.target.value)}
          />

          <label>Status</label>
          <select
            value={statusId ?? ""}
            onChange={e => setStatusId(Number(e.target.value))}
          >
            <option value="">Selecione</option>
            {status.map(s => (
              <option key={s.id_status} value={s.id_status}>
                {s.nome}
              </option>
            ))}
          </select>

          <label>Imagem</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setImagem(e.target.files?.[0] || null)}
          />

          <button disabled={loading}>
            {loading ? "Salvando..." : "Salvar Banner"}
          </button>
        </div>

        {/* PREVIEW */}
        <div className="painel-card preview-card">
          <div className="banner-preview">
            {preview ? (
              <img src={preview} />
            ) : (
              <span>Preview do banner</span>
            )}
            <div className="overlay">
              <h3>{titulo || "Título do banner"}</h3>
              {descricao && <p>{descricao}</p>}
            </div>
          </div>
        </div>
      </form>

      <style jsx global>{`
        .painel-page {
          background: #f3f4f6;
          padding: 28px;
          min-height: 100vh;
        }

        .painel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .painel-header h1 {
          font-size: 22px;
          font-weight: 700;
        }

        .painel-header button {
          background: #fff;
          border: 1px solid #ddd;
          padding: 8px 14px;
          border-radius: 8px;
        }

        .painel-grid {
          display: grid;
          grid-template-columns: 1.1fr .9fr;
          gap: 24px;
        }

        .painel-card {
          background: #fff;
          border-radius: 14px;
          padding: 20px;
          box-shadow: 0 8px 20px rgba(0,0,0,.06);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .painel-card label {
          font-size: 13px;
          font-weight: 600;
        }

        .painel-card input,
        .painel-card textarea,
        .painel-card select {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 10px;
        }

        .painel-card button {
          margin-top: 10px;
          background: #111827;
          color: #fff;
          border: none;
          padding: 12px;
          border-radius: 10px;
          font-weight: 600;
        }

        .preview-card {
          padding: 0;
          overflow: hidden;
        }

        .banner-preview {
          position: relative;
          height: 100%;
          min-height: 280px;
          background: #e5e7eb;
        }

        .banner-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .banner-preview span {
          display: flex;
          height: 100%;
          align-items: center;
          justify-content: center;
          color: #6b7280;
        }

        .overlay {
          position: absolute;
          inset: 0;
          padding: 18px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          background: linear-gradient(
            to top,
            rgba(0,0,0,.6),
            rgba(0,0,0,.05)
          );
        }

        .overlay h3 {
          color: #fff;
          font-size: 18px;
          margin: 0;
        }

        .overlay p {
          font-size: 13px;
          color: #e5e7eb;
        }

        @media (max-width: 900px) {
          .painel-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
