import React, { useState } from "react";
import Layout from "../components/Layout"

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    if (res.ok) {
      window.location.href = "/";
    } else {
      setError("Nieprawidłowe dane logowania");
    }
  };

      const inputStyle = {
        width: "15vw",
        padding: "10px",
        marginBottom: "15px",
        borderRadius: "8px",
        border: "1px solid #ccc"
    }

  return (
  <Layout pageTitle = "Logowanie">
    <form onSubmit={handleLogin} style={{ textAlign: "center" }}>
      <span style={{ color: "crimson" }}>{error}</span><br/><br/>
      <label>Nazwa użytkownika</label><br/><br/>
      <input style={inputStyle} type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /><br/><br/>
      <label>Hasło</label><br/><br/>
      <input style={inputStyle} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /><br/><br/>
      <span>Nie masz konta? <a href='/register'>Zarejestruj się</a></span><br></br>
      <button className="login" style={{marginTop: "2vw"}}type="submit">Zaloguj się</button>
    </form>
  </Layout>
  );
}