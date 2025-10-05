import React, { useState, useEffect } from "react";
import "./Slides.css";

const API_URL = "https://slides-backend-hu6m.onrender.com";

export default function App() {
  const [assunto, setAssunto] = useState("");
  const [texto, setTexto] = useState("");
  const [slides, setSlides] = useState([]);
  const [mostrarTodos, setMostrarTodos] = useState(false);

  // 🔹 Carregar slides ao iniciar
  useEffect(() => {
    carregarSlides();
  }, []);

  async function carregarSlides() {
    try {
      const res = await fetch(`${API_URL}/`);
      if (!res.ok) throw new Error("Erro ao buscar slides");
      const data = await res.json();
      setSlides(data);
    } catch (err) {
      console.error("Erro:", err);
    }
  }

  async function cadastrarSlide(e) {
    e.preventDefault();
    if (!assunto || !texto) return alert("Preencha todos os campos!");

    const novoSlide = {
      assunto,
      texto,
      autor: "Autor Teste",
      data: new Date().toISOString()
    };

    try {
      const res = await fetch(`${API_URL}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novoSlide)
      });

      if (!res.ok) throw new Error("Erro ao cadastrar slide");

      setAssunto("");
      setTexto("");
      carregarSlides();
    } catch (err) {
      console.error("Erro:", err);
    }
  }

  const slidesExibidos = mostrarTodos ? slides : slides.slice(0, 5);

  return (
    <div className="container">
      <nav className="navbar">
        <h1>Cadastro de Slides</h1>
        <span>{new Date().toLocaleDateString("pt-BR")}</span>
      </nav>

      <form className="formulario" onSubmit={cadastrarSlide}>
        <input
          type="text"
          placeholder="Assunto"
          value={assunto}
          onChange={(e) => setAssunto(e.target.value)}
        />
        <textarea
          placeholder="Texto"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <button type="submit">Cadastrar</button>
      </form>

      <h2>Slides Cadastrados</h2>
      <ul className="lista-slides">
        {slidesExibidos.map((colTema) => (
          <li key={colTema._id}>
            <strong>{colTema.assunto}</strong> <br />
            {slide.texto} <br />
            <small>
              Autor: {colTema.autor} | Data:{" "}
              {new Date(colTema.data).toLocaleString("pt-BR")}
            </small>
          </li>
        ))}
      </ul>

      {colTema.length > 5 && (
        <button onClick={() => setMostrarTodos(!mostrarTodos)}>
          {mostrarTodos ? "Ver menos" : "Ver mais"}
        </button>
      )}
    </div>
  );
}


