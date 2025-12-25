'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/Api/conectar";

type TipoCupom = {
  id_tipo: number;
  nome: string;
  codigo: "percentual" | "valor" | "frete" | string;
  descricao?: string;
  statusid?: number;
};

export default function NovoCupomPage() {
  const router = useRouter();

  const [tipos, setTipos] = useState<TipoCupom[]>([]);
  const [loadingTipos, setLoadingTipos] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    codigo: "",
    descricao: "",
    tipo_id: "",
    desconto: "",
    valor_minimo: "",
    limite_uso: "",
    inicio: "",
    expiracao: "",
    statusid: 1,
  });

  // Mensagens de validação simples
  const [validation, setValidation] = useState<{[k:string]:string}>({});

  useEffect(() => {
    async function carregarTipos() {
      console.log("[cupom] buscando tipos: GET /admin/cupom/tipos");
      try {
        const res = await api.get("/admin/cupom/tipos", { withCredentials: true });
        console.log("[cupom] resposta tipos:", res.data);
        const dados = Array.isArray(res.data?.dados) ? res.data.dados : [];
        setTipos(dados);
      } catch (err) {
        console.error("[cupom] erro ao carregar tipos", err);
        setError("Erro ao carregar tipos de cupom.");
      } finally {
        setLoadingTipos(false);
      }
    }
    carregarTipos();
  }, []);

  const tipoSelecionado = tipos.find(t => String(t.id_tipo) === String(form.tipo_id));

  function gerarCodigo(prefix = "PROMO") {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let codigo = "";
    for (let i = 0; i < 6; i++) codigo += chars[Math.floor(Math.random() * chars.length)];
    const final = `${prefix}-${codigo}`;
    setForm(f => ({ ...f, codigo: final }));
    console.log("[cupom] código gerado:", final);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setValidation(v => ({ ...v, [name]: "" }));
  }

  function validar(): boolean {
    const v: {[k:string]:string} = {};
    if (!form.codigo || form.codigo.trim().length < 3) v.codigo = "Código obrigatório (mín. 3 chars)";
    if (!form.tipo_id) v.tipo_id = "Selecione um tipo de cupom";
    // se não for frete, desconto precisa ser número > 0
    if (tipoSelecionado?.codigo !== "frete") {
      const d = parseFloat(String(form.desconto));
      if (isNaN(d) || d <= 0) v.desconto = "Informe um desconto válido";
    }
    // datas
    if (!form.inicio) v.inicio = "Data de início obrigatória";
    if (!form.expiracao) v.expiracao = "Data de expiração obrigatória";
    // expiracao depois de inicio
    if (form.inicio && form.expiracao) {
      const ini = new Date(form.inicio);
      const exp = new Date(form.expiracao);
      if (exp < ini) v.expiracao = "Expiração deve ser após início";
    }
    setValidation(v);
    return Object.keys(v).length === 0;
  }

  async function salvar(e?: React.FormEvent) {
    if (e) e.preventDefault();
    console.log("[cupom] salvar: iniciando validação");
    if (!validar()) {
      console.warn("[cupom] validação falhou", validation);
      return;
    }

    // montar payload convertendo tipos corretamente
    const payload: any = {
      codigo: String(form.codigo).trim(),
      descricao: form.descricao || "",
      tipo_id: Number(form.tipo_id),
      desconto: 0.0,
      valor_minimo: form.valor_minimo ? Number(form.valor_minimo) : 0.0,
      limite_uso: form.limite_uso ? Number(form.limite_uso) : null,
      inicio: form.inicio || null,
      expiracao: form.expiracao || null,
      statusid: Number(form.statusid || 1),
    };

    // desconto: se tipo frete -> 0.0, se percentual/valor -> parse float
    if (tipoSelecionado?.codigo === "frete") {
      payload.desconto = 0.0;
    } else {
      payload.desconto = form.desconto ? parseFloat(String(form.desconto)) : 0.0;
    }

    console.log("[cupom] payload final:", payload);

    setSalvando(true);
    try {
      const res = await api.post("/admin/cupom/criar", payload, { withCredentials: true });
      console.log("[cupom] resposta criar:", res.data);
      if (res.status === 201 || res.data?.status === 201 || res.data?.mensagem?.toLowerCase()?.includes("sucesso")) {
        alert("Cupom criado com sucesso!");
        // opcional: redirecionar para lista de cupons
        router.push("/admin/cupons");
      } else {
        alert("Resposta inesperada do servidor. Veja console.");
        console.warn("[cupom] resposta inesperada:", res);
      }
    } catch (err: any) {
      console.error("[cupom] erro ao criar cupom", err);
      const msg = err?.response?.data?.mensagem || err?.message || "Erro desconhecido";
      alert("Erro ao criar cupom: " + msg);
    } finally {
      setSalvando(false);
    }
  }

  // Preview - formata o rótulo do desconto
  function renderDescontoPreview() {
    if (!tipoSelecionado) return null;
    if (tipoSelecionado.codigo === "percentual") {
      return form.desconto ? `${Number(form.desconto).toFixed(2)}% OFF` : "XX% OFF";
    }
    if (tipoSelecionado.codigo === "valor") {
      return form.desconto ? `R$ ${Number(form.desconto).toFixed(2)} OFF` : "R$ XX,XX OFF";
    }
    if (tipoSelecionado.codigo === "frete") {
      return "FRETE GRÁTIS";
    }
    return form.desconto ? `${form.desconto}` : "Desconto";
  }

  return (
    <div className="cupom-page container">
      <style>{`
        .cupom-page { padding: 24px; font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; max-width: 1100px; margin: 0 auto;}
        .top { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:18px;}
        .card { background:#fff; border-radius:12px; box-shadow:0 10px 30px rgba(17,24,39,0.06); padding:18px; }
        .grid { display:grid; grid-template-columns: 1fr 360px; gap:18px; align-items:start; }
        .form { padding:12px; }
        label { display:block; font-weight:600; margin-bottom:6px; font-size:14px; color:#111827; }
        input, select, textarea { width:100%; padding:10px 12px; border-radius:8px; border:1px solid #e5e7eb; font-size:14px; margin-bottom:12px; }
        textarea { min-height:80px; resize:vertical; }
        .row-grid { display:grid; grid-template-columns: repeat(2, 1fr); gap:10px; }
        .actions { display:flex; gap:8px; justify-content:flex-end; margin-top:8px; }
        .btn { padding:10px 16px; border-radius:10px; cursor:pointer; border:none; font-weight:600; }
        .btn.secondary { background:#f3f4f6; color:#111827; }
        .btn.primary { background: linear-gradient(90deg,#c97a7e,#d4af37); color:white; box-shadow:0 6px 18px rgba(201,122,126,0.12); }
        .btn.ghost { background:transparent; border:1px solid #e5e7eb; }
        .preview { padding:16px; background: linear-gradient(180deg,#fffaf0,#fff); border-radius:10px; height:100%; display:flex; flex-direction:column; justify-content:space-between; }
        .preview-top { display:flex; justify-content:space-between; align-items:center; gap:8px; }
        .preview-code { font-weight:800; font-size:20px; color:#6b4c4f; letter-spacing:1px; }
        .preview-desc { color:#374151; margin-top:8px; }
        .badge { background:#111827; color:white; padding:8px 10px; border-radius:999px; font-weight:700; font-size:13px; }
        .meta { color:#6b7280; font-size:13px; margin-top:12px; }
        .error { color:#dc2626; font-size:13px; margin-top:-8px; margin-bottom:8px; }
        .small-muted { color:#6b7280; font-size:13px; }
        @media (max-width: 900px) {
          .grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="top">
        <h2>Criar cupom</h2>
        <div className="small-muted">Rota: <code>/admin/cupom/criar</code> — Veja console para logs</div>
      </div>

      <div className="grid">
        <div className="card form">
          <form onSubmit={salvar}>
            <div style={{display:"flex", gap:8}}>
              <div style={{flex:1}}>
                <label>Código</label>
                <input name="codigo" value={form.codigo} onChange={handleChange} placeholder="EX: PROMO10" />
                {validation.codigo && <div className="error">{validation.codigo}</div>}
              </div>
              <div style={{width:120}}>
                <label>&nbsp;</label>
                <button type="button" onClick={() => gerarCodigo()} className="btn ghost" style={{width:"100%"}}>Gerar</button>
              </div>
            </div>

            <label>Tipo do cupom</label>
            <select name="tipo_id" value={form.tipo_id} onChange={handleChange}>
              <option value="">— selecione —</option>
              {tipos.map(t => <option key={t.id_tipo} value={t.id_tipo}>{t.nome} ({t.codigo})</option>)}
            </select>
            {validation.tipo_id && <div className="error">{validation.tipo_id}</div>}

            <div className="row-grid">
              <div>
                <label>Desconto {tipoSelecionado?.codigo === "percentual" ? "(%)" : tipoSelecionado?.codigo === "valor" ? "(R$)" : ""}</label>
                <input name="desconto" type="number" step="0.01" value={form.desconto} onChange={handleChange} disabled={tipoSelecionado?.codigo === "frete"} placeholder={tipoSelecionado?.codigo === "frete" ? "Frete grátis" : "Ex: 10 ou 50.0"} />
                {validation.desconto && <div className="error">{validation.desconto}</div>}
              </div>
              <div>
                <label>Valor mínimo</label>
                <input name="valor_minimo" type="number" step="0.01" value={form.valor_minimo} onChange={handleChange} placeholder="Ex: 100.00" />
              </div>
            </div>

            <div className="row-grid">
              <div>
                <label>Início</label>
                <input name="inicio" type="date" value={form.inicio} onChange={handleChange} />
                {validation.inicio && <div className="error">{validation.inicio}</div>}
              </div>
              <div>
                <label>Expiração</label>
                <input name="expiracao" type="date" value={form.expiracao} onChange={handleChange} />
                {validation.expiracao && <div className="error">{validation.expiracao}</div>}
              </div>
            </div>

            <label>Limite de uso</label>
            <input name="limite_uso" type="number" value={form.limite_uso} onChange={handleChange} placeholder="quantas vezes pode ser usado (opcional)" />

            <label>Descrição</label>
            <textarea name="descricao" value={form.descricao} onChange={handleChange} placeholder="Ex: Cupom de boas-vindas para novos clientes" />

            <div className="actions">
              <button type="button" className="btn secondary" onClick={() => router.back()}>Cancelar</button>
              <button type="button" className="btn" onClick={() => { /* quick preview save */ salvar(); }} style={{background:"#f59e0b"}} disabled={salvando}>
                {salvando ? "Salvando..." : "Salvar cupom"}
              </button>
            </div>
          </form>
        </div>

        {/* PREVIEW */}
        <div className="card preview">
          <div>
            <div className="preview-top">
              <div>
                <div className="preview-code">{form.codigo || "PROMO-XXXXXX"}</div>
                <div className="preview-desc">{form.descricao || "Descrição do cupom aparecerá aqui"}</div>
              </div>
              <div>
                <div className="badge">{renderDescontoPreview()}</div>
              </div>
            </div>

            <div style={{marginTop:12}}>
              <div className="meta">Tipo: <strong>{tipoSelecionado?.nome ?? "—"}</strong> ({tipoSelecionado?.codigo ?? "—"})</div>
              <div className="meta">Validade: <strong>{form.inicio ? new Date(form.inicio).toLocaleDateString() : "—"}</strong> → <strong>{form.expiracao ? new Date(form.expiracao).toLocaleDateString() : "—"}</strong></div>
              <div className="meta">Valor mínimo: <strong>R$ {form.valor_minimo ? Number(form.valor_minimo).toFixed(2) : "0.00"}</strong></div>
              <div className="meta">Limite de uso: <strong>{form.limite_uso || "Ilimitado"}</strong></div>
            </div>
          </div>

          <div style={{textAlign:"center", marginTop:12}}>
            <small className="small-muted">Preview real-time — como vai aparecer para o cliente</small>
          </div>
        </div>
      </div>
    </div>
  );
}
