import React, { useState, useEffect } from "react";
import "./Slides.css";

const API_URL = "https://slides-backend-hu6m.onrender.com";

export default function App() {
  const [assunto, setAssunto] = useState("");
  const [texto, setTexto] = useState("");
  const [autor, setAutor] = useState(""); // Campo autor adicional caso queira editar na tela
  const [slides, setSlides] = useState([]);
  const [mostrarTodos, setMostrarTodos] = useState(false);

  // Carregar slides ao iniciar
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
      data: new Date().toISOString(),
      assunto,
      texto,
      autor: autor || "Autor Teste"
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
      setAutor("");
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
        <input
          type="text"
          placeholder="Autor"
          value={autor}
          onChange={(e) => setAutor(e.target.value)}
        />
        <button type="submit">Cadastrar</button>
      </form>

      <h2>Slides Cadastrados</h2>
      <ul className="lista-slides">
        {slidesExibidos.map((item) => (
          <li key={item._id}>
            <strong>{item.slide.assunto}</strong> <br />
            {item.slide.texto} <br />
            <small>
              Autor: {item.slide.autor} | Data:{" "}
              {item.slide.data
                ? new Date(item.slide.data).toLocaleString("pt-BR")
                : ""}
            </small>
          </li>
        ))}
      </ul>

      {slides.length > 5 && (
        <button onClick={() => setMostrarTodos(!mostrarTodos)}>
          {mostrarTodos ? "Ver menos" : "Ver mais"}
        </button>
      )}
    </div>
  );
}
