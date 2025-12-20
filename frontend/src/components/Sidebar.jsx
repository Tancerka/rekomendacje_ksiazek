import React from "react"

export default function Sidebar({active}){
return(
    <nav id = "nav-bar" className ={`sidebar ${active ? "active" : ""}`}>
        <h2 className= "montecarlo-regular" style={{
            fontSize: "24px",
            overflowWrap: "wrap",
            textAlign: "center",
            marginTop: "30px",
            color: "white",
            letterSpacing: "2px"
        }}> Rekomendacje książek</h2>
        <button className = "sidebar-btn" onClick={() => (window.location.href='/')} style={{marginTop: "30px"}}>Menu</button><br></br>
        <button className = "sidebar-btn" onClick={() => (window.location.href='/recommend')}>Rekomendacje</button><br></br>
        <button className = "sidebar-btn" onClick={() => (window.location.href='/favorites')}>Ulubione</button><br></br>
        <button className = "sidebar-btn" onClick={() => (window.location.href='/wishlist')}>Lista życzeń</button><br></br>
        <button className = "sidebar-btn" onClick={() => (window.location.href='/profile')}>Profil</button><br></br>
    </nav>
);
}