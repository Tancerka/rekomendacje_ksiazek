import React, {useState, useEffect, use} from 'react';
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"

export default function Layout({ pageTitle, children}) {

    const [navVisible, setNavVisible] = useState(false);
    const [query, setQuery] = useState("");
    const [user, setUser] = useState();
    const navigate = useNavigate();

    const toggleNav = () => setNavVisible((v) => !v);

    const searchBook = () => {
        if(query.trim() !== "") {
            navigate(`/search?q=${encodeURIComponent(query)}`);
        }
    };

    useEffect(() => {
        const handleMouseMove = (event) => {
            if(window.innerWidth > 768){
                if (event.clientX <= 10 && !navVisible) setNavVisible(true);
                else if (event.clientX > 150 && navVisible) setNavVisible(false);
            }
        };
        document.addEventListener("mousemove", handleMouseMove);
        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
        };
    }, [navVisible]);

    useEffect(() => {
        fetch("http://localhost:5000/auth/me", {
            credentials: "include"
        })
        .then(res => res.json())
        .then(data => setUser(data.user))
        .catch(err => console.error(err));
    }, []);

    return (
        <div>
            <div className = "top-bar">
            <button className="title montecarlo-regular title" onClick={() => window.location.pathname = '/'} /* style={{ marginLeft: "5%", marginRight: "10%"}} */>Rekomendacje książek</button>
            <div className="search">
                    <input type="text" style={{/* width: "300px", marginTop: "1%", */ backgroundColor: "transparent"}} placeholder="Wyszukaj książkę..." id="search-bar" value={query} onChange={(e)=>setQuery(e.target.value)} onKeyDown={(e)=> e.key === "Enter" && searchBook()} />
                    <button className="search-btn" onClick={searchBook}>
                        <img src="../img/search_icon.png" alt="Szukaj" onMouseOver={(e)=> (e.target.src = "../img/search_icon_hover.png")} onMouseOut={(e)=>(e.target.src = "/img/search_icon.png")} />
                    </button>
            </div>
            <div className="auth">

                    { user ? (
                        <>
                            <button className="login" onClick={() => navigate('/profile')}>{user.username}</button>
                            <button className="logout" onClick={async () => {
                                const data = await fetch("/auth/logout", {
                                    method: "POST", 
                                    credentials: "include"
                                });
                                toast.success(data.message);
                                navigate("/login")
                            }}>Wyloguj się</button>
                        </>
                    ) : (
                        <button className="login" onClick={() => navigate('/login')}>Zaloguj się</button>
                    )}
                    </div>
            </div>
            <hr className="solid" />
            <hr className="line"/>
            <h3 className = "subtitle">{pageTitle}</h3>
            <hr className="line" style={{width: "25%", marginTop: "2vw"}}/>
            <div
                className={`nav-arrow ${navVisible ? "open": ""}`} 
                onClick={toggleNav}
                >
                    {navVisible ? "<" : ">"}
                </div>
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