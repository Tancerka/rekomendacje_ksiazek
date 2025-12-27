import { useState, useEffect} from "react"

export default function Sidebar({active}){

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/auth/me", {credentials: "include"})
        .then(res => res.json())
        .then(data =>{
            setUser(data.user);
            setLoading(false);
        }
        ).catch(()=> setLoading(false))
    }, []);


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
        {user?.role === "admin" && (
            <>
                <hr style={{ 
                    margin: "20px 0",
                    opacity: "0.3"
                }}/>
                <button 
                    className="sidebar-btn"
                    onClick={() => window.location.href='/admin'}
                    >
                    Panel Admina
                    </button>
            </>
        )}
    </nav>
);
}