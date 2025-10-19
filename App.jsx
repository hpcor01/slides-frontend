import React, { useState, useEffect } from "react";
import "./Slides.css";

const API = import.meta.env.VITE_API_URL || "https://slides-backend-hu6m.onrender.com";

function Toast({ message, type }) {
  if (!message) return null;
  const bg = type === "success" ? "#2ecc71" : "#e74c3c";
  return (
    <div
      style={{
        position: "fixed",
        right: 20,
        top: 20,
        padding: "10px 16px",
        borderRadius: 6,
        color: "#fff",
        background: bg,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        zIndex: 9999,
      }}
    >
      {message}
    </div>
  );
}

export default function App() {
  const [slides, setSlides] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ data: "", assunto: "", texto: "", autor: "" });
  const [toast, setToast] = useState({ message: "", type: "success" });

  useEffect(() => {
    carregarSlides(page);
  }, [page]);

  async function carregarSlides(p = 1) {
    try {
      setLoading(true);
      const res = await fetch(`${API}/?page=${p}&limit=${limit}`);
      const data = await res.json();

      // Caso o backend use formato paginado
      if (data && data.success) {
        setSlides(data.slides || []);
        setTotalPages(data.totalPages || 1);
        setPage(data.currentPage || p);
      }
      // Caso o backend retorne array simples
      else if (Array.isArray(data)) {
        const total = data.length;
        const totalP = Math.ceil(total / limit);
        const start = (p - 1) * limit;
        const paged = data.slice(start, start + limit);
        setSlides(paged);
        setTotalPages(totalP);
      } else {
        setSlides(data.slides || []);
      }
    } catch (err) {
      console.error("Erro ao carregar slides:", err);
      setToast({ message: "Erro ao carregar slides", type: "error" });
    } finally {
      setLoading(false);
      setTimeout(() => setToast({ message: "", type: "success" }), 3000);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();

      if (json && json.success) {
        setToast({ message: json.message || "Cadastrado com sucesso", type: "success" });
        setForm({ data: "", assunto: "", texto: "", autor: "" });
        carregarSlides(page);
      } else {
        setToast({ message: json.message || "Erro ao cadastrar", type: "error" });
      }
    } catch (err) {
      console.error("Erro ao cadastrar:", err);
      setToast({ message: "Erro ao cadastrar slide", type: "error" });
    } finally {
      setTimeout(() => setToast({ message: "", type: "success" }), 3000);
    }
  }

  function toggleExpand(index) {
    setSlides((prev) =>
      prev.map((s, i) => (i === index ? { ...s, _expanded: !s._expanded } : s))
    );
  }

  return (
    <div className="container">
      <Toast message={toast.message} type={toast.type} />
      <h1>Cadastro de Slides</h1>

      <form className="form" onSubmit={handleSubmit}>
        <input
          name="data"
          placeholder="Data (dd/mm/aaaa)"
          value={form.data}
          onChange={handleChange}
          required
        />
        <input
          name="assunto"
          placeholder="Assunto"
          value={form.assunto}
          onChange={handleChange}
          required
        />
        <textarea
          name="texto"
          placeholder="Texto"
          rows={6}
          value={form.texto}
          onChange={handleChange}
          required
        />
        <input
          name="autor"
          placeholder="Autor"
          value={form.autor}
          onChange={handleChange}
          required
        />
        <button type="submit">Cadastrar</button>
      </form>

      <div className="list">
        {loading && <p>Carregando...</p>}
        {!loading && slides.length === 0 && <p>Nenhum slide encontrado.</p>}

        {slides.map((s, idx) => {
          const texto = s?.slide?.texto || "";
          const linhas = texto.split(/\r?\n/);
          const precisaVerMais = linhas.length > 5;
          const expandido = !!s._expanded;
          const textoExibido = precisaVerMais && !expandido ? linhas.slice(0, 5).join("\n") : texto;

          return (
            <div className="card" key={s._id ? s._id.$oid || s._id : idx}>
              <div className="meta">
                <strong>{s.slide.data}</strong> - {s.slide.assunto}
              </div>
              <pre className="texto">{textoExibido}</pre>

              {precisaVerMais && (
                <button className="link" onClick={() => toggleExpand(idx)}>
                  {expandido ? "Ver menos" : "Ver mais"}
                </button>
              )}

              <div className="autor">Autor: {s.slide.autor}</div>
            </div>
          );
        })}
      </div>

      <div className="pagination">
        <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
          Anterior
        </button>
        <span>
          Página {page} de {totalPages}
        </span>
        <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
          Próximo
        </button>
      </div>
    </div>
  );
}
