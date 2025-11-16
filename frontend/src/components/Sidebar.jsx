import React from "react"

export default function Sidebar({active}){
return(
    <nav id = "nav-bar" className ={`sidebar ${active ? "active" : ""}`}>
        <button className = "sidebar-btn" onClick={() => (window.location.href='/')} style={{marginTop: "100px"}}>Menu</button><br></br>
        <button className = "sidebar-btn" onClick={() => (window.location.href='/recommend')}>Rekomendacje</button><br></br>
        <button className = "sidebar-btn" onClick={() => (window.location.href='/favorites')}>Ulubione</button><br></br>
        <button className = "sidebar-btn" onClick={() => (window.location.href='/wishlist')}>Lista życzeń</button><br></br>
    </nav>
);
}