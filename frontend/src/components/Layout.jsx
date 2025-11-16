import React, {useState, useEffect, use} from 'react';
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";

export default function Layout({ pageTitle, children, user }) {

    const [navVisible, setNavVisible] = useState(false);
    const [query, setQuery] = useState("");
    const navigate = useNavigate();

    const toggleNav = () => setNavVisible((v) => !v);

    const searchBook = () => {
        if(query.trim() !== "") {
            navigate(`/search?q=${encodeURIComponent(query)}`);
        }
    };

    useEffect(() => {
        const handleMouseMove = (event) => {
            if (event.clientX <= 10 && !navVisible) setNavVisible(true);
            else if (event.clientX > 150 && navVisible) setNavVisible(false);
        };
        document.addEventListener("mousemove", handleMouseMove);
        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
        };
    }, [navVisible]);

    return (
        <div>
            <div class = "top-bar" style={{ backgroundColor: "#D4C9BE"}}>
            <button className="title montecarlo-regular title" onClick={() => window.location.pathname = '/'} style={{ marginLeft: "5%", marginRight: "10%"}}>Rekomendacje książek</button>
                    <input type="text" style={{width: "300px", marginTop: "2%", backgroundColor: "transparent"}} placeholder="Wyszukaj książkę..." id="search-bar" value={query} onChange={(e)=>setQuery(e.target.value)} onKeyDown={(e)=> e.key === "Enter" && searchBook()} />
                    <input id="search-icon" type="image" onClick={searchBook} src="../img/search_icon.png" style={{backgroundColor: "transparent", width: "3%", height: "2%", marginTop: "1vw", marginRight: "5vw"}} onMouseOver={(e)=> (e.target.src = "../img/search_icon_hover.png")} onMouseOut={(e)=>(e.target.src = "/img/search_icon.png")} />
                    { user ? (
                        <>
                            <button className="login" style={{width: "10vw", margin: "0", marginTop: "2vw"}} onClick={() => window.location.pathname = '/profile'}>{user.username}</button>
                            <button className="logout" onClick={() => window.location.pathname = '/logout'}>Wyloguj się</button>
                        </>
                    ) : (
                        <button className="login" onClick={() => window.location.pathname = '/login'}>Zaloguj się</button>
                    )}
            </div>
            <hr className="solid" />
            <hr className="line"/>
            <h3 className = "subtitle">{pageTitle}</h3>
            <hr className="line" style={{width: "25%", marginTop: "2vw"}}/> 
            <Sidebar active={navVisible} />
            <div className="content" style={{ minHeight: "60vh"}}>
                {children}
            </div>
            <footer>
                <p style={{marginBottom: "0"}}>&copy; 2025 Rekomendacje książek</p>
                <br/>
            </footer>
        </div>
    );
}