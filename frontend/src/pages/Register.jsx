import React, { useState } from "react";
import Layout from "../components/Layout"

export default function Register() {
  const [form, setForm] = useState({ username: "", email:"", password: "", repeat_password: "" });
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    const res = await fetch("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    if (res.ok) {
      window.location.href = "/login";
    } else {
      const data = await res.json()
      setError(data.error);
    }
  };

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value});
  }

  const inputStyle = {
    width: "15vw",
    padding: "10px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid #ccc"
  }

  return (
<Layout pageTitle = "Rejestracja">
    <form onSubmit={handleRegister} style={{textAlign: "center"}}>
        <div><br/>
            {error && <span style={{color:"crimson"}}> {error} </span>}<br/>
            <label for="username" className="form-label" style={{marginTop: "2vw"}}>Nazwa użytkownika</label><br/>
            <input style= {inputStyle} type="text" className="form-control" id="username" name="username" value={form.username} onChange={handleChange} required/>
        </div>
        <div>
            <label for="email" className="form-label">Email</label><br/>
            <input style= {inputStyle} type="text" className="form-control" id="email" name="email" value={form.email} onChange={handleChange} required/>
        </div>
        <div>
            <label for="password" className="form-label">Hasło</label><br/>
            <input style= {inputStyle} type="password" className="form-control" id="password" name="password" value = {form.password} onChange={handleChange} required/>
        </div>    
        <div>
            <label for="repeatPassword" className="form-label">Powtórz hasło</label><br/>
            <input style= {inputStyle} type="password" className="form-control" id="repeat-password" name="repeat_password" value={form.repeat_password} onChange={handleChange} required/>
        </div><br/>
        <button type="submit" className="btn login">Zarejestruj</button>
    </form>
  </Layout>
  );
}