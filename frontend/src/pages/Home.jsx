import React, {useEffect, useState} from "react";
import Layout from "../components/Layout"
import { useNavigate } from "react-router-dom";

export default function Home(){


    const [query, setQuery] = useState("");

    const navigate = useNavigate();

    const [selectedEmotion, setSelectedEmotion] = useState(null);

    const emotions = [
        {name: "Ciekawość", emoji: "🤔", color: "#FFE584"},
        {name: "Podziw", emoji: "😍", color: "#E6E6FA"},
        {name: "Zaskoczenie", emoji: "😲", color: "#FFE4E1"},
        {name: "Miłość", emoji: "❤️", color: "#FFB6C1"},
        {name: "Wstręt", emoji: "🤢", color: "#D3D3D3"},
        {name: "Rozbawienie", emoji: "😂", color: "#FFEB9C"},
        {name: "Radość", emoji: "😊", color: "#FFD700"},
        {name: "Zatwierdzenie", emoji: "👍", color: "#98FB98"},
        {name: "Irytacja", emoji: "😒", color: "#FFA07A"},
        {name: "Dezaprobata", emoji: "👎", color: "#CD853F"},
        {name: "Neutralne", emoji: "😐", color: "#F5F5DC"},
        {name: "Uzmysłowienie", emoji: "💡", color: "#F0E68C"},
        {name: "Rozczarowanie", emoji: "😞", color: "#B0C4DE"},
        {name: "Pragnienie", emoji: "😩", color: "#FF6347"},
        {name: "Zmieszanie", emoji: "😕", color: "#DDA0DD"},
        {name: "Strach", emoji: "😱", color: "#9370DB"},
        {name: "Wyrzuty sumienia", emoji: "😔", color: "#BC8F8F"},
        {name: "Smutek", emoji: "😢", color: "#ADD8E6"},
        {name: "Troska", emoji: "😔", color: "#E0FFFF"},
        {name: "Gniew", emoji: "😠", color: "#ff5764"},
        {name: "Zakłopotanie", emoji: "😳", color: "#ffbfc4"},
        {name: "Ekscytacja", emoji: "😲", color: "#d99177"},
        {name: "Wdzięczność", emoji: "🤗", color: "#e8c7ff"},
        {name: "Żal", emoji: "😔", color: "#929af7"},
        {name: "Nerwowość", emoji: "🫥", color: "#edbf82"},
        {name: "Optymizm", emoji: "😀", color: "#a6ffdd"},
        {name: "Duma", emoji: "🥹", color: "#c9a287"},
        {name: "Ulga", emoji: "😮‍💨", color: "#d6ffd4"}

    ]

    return(

        <Layout pageTitle = "Strona główna">
                <p style={{textAlign: "center", fontSize: "24px", color: "#123578"}}> Jak się dziś czujesz?</p>
                <p style={{textAlign: "center", fontSize: "18px", color: "#7A6A62"}}> Wybierz swoją emocję i odkryj książki idealnie dopasowane do Twojego nastroju! </p>
                <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "15px", marginBottom: "60px", marginLeft: "10%", marginRight:"10%"}}>
                {emotions.map((emotion) => (
                    <button
                        key={emotion.name}
                        style={{
                            fontSize: "16px",
                            fontWeight: selectedEmotion === emotion.name ? "600" : "400",
                            padding: "20px 20px",
                            cursor: "pointer",
                            backgroundColor: selectedEmotion === emotion.name ? emotion.color : "#F5F5F0",
                            color: "#5A4A42",
                            border: selectedEmotion === emotion.name ? `3px solid ${emotion.color}` : "2px solid #ccc",
                            borderRadius: "12px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "8px",
                            boxShadow: selectedEmotion === emotion.name ? "0 4px 8px rgba(0, 0, 0, 0.2)" : "0 2px 4px rgba(0, 0, 0, 0.1)",
                            transform: selectedEmotion === emotion.name ? "translateY(-2px)" : "none",
                            transition: "all 0.3s ease"
                        }}
                        onMouseOut={(e) => {
                            if (selectedEmotion !== emotion.name){
                                e.currentTarget.style.backgroundColor = "#f0f0f0";
                                e.currentTarget.style.transform = "none";
                                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
                            }
                        }}
                        onMouseOver={(e) => {
                            if (selectedEmotion !== emotion.name){
                                e.currentTarget.style.backgroundColor = emotion.color;
                                e.currentTarget.style.transform = "none";
                                e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
                            }
                        }}
                        
                        onClick={() => {
                            setSelectedEmotion(emotion.name);
                            navigate(`/search?emotion=${encodeURIComponent(emotion.name)}`);
                        }}
                    >  
                    <span style={{fontSize: "24px", backgroundColor: "transparent"}}>{emotion.emoji}</span> 
                    <span style={{backgroundColor: "transparent"}}>{emotion.name}</span>
                    </button>
                ))}
                </div>
                
                <div style={{backgroundColor: "#D4C9BE", padding: "40px", borderRadius: "12px", marginTop:"60px", marginBottom:"40px"}}>
                    <h3 style={{fontSize: "28px", textAlign: "center", color: "#123578", marginBottom: "20px", backgroundColor: "#D4C9BE", fontWeight: "bold"}}> Jak to działa? </h3>
                    <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "30px", marginTop: "30px", backgroundColor: "#D4C9BE"}}>
                        <Step 
                            number={1}
                            title="Wybierz emocję"
                            description="Wyszukaj lub przeglądaj książki według swojego nastroju. Możesz też wyszukać po tytule, autorze lub kategorii."
                            />
                        <Step 
                            number={2}
                            title="Odkryj książki"
                            description="Dodaj książki do ulubionych lub na listę życzeń, aby łatwo je znaleźć później. Na ich podstawie otrzymasz rekomendacje dopasowane do Twojego nastroju."
                            />
                        <Step 
                            number={3}
                            title="Otrzymaj rekomendacje"
                            description="Przejdź do sekcji rekomendacji, aby zobaczyć książki idealnie dopasowane do Twojego nastroju i preferencji czytelniczych."
                            />
                        <Step 
                            number={4}
                            title="Ciesz się czytaniem"
                            description="Zanurz się w lekturze książek, które nie tylko bawią, ale także wzbogacają Twoje emocje i doświadczenia."
                            />
                    </div>
                </div>


                <Section title="Najwyżej notowane książki po emocjach" description="Lista książek o najwyższych ocenach w danej emocji." />

                <Section title="Książki na każdy nastrój" description="Wybierz książkę na każdy humor" />

                <Section title="Najwyżej ocenione" description ="Książki o najwyższych ocenach"/>

                <Section title="Na zimowy wieczór" description="Książki idealne na długie, zimowe wieczory"/> 

        </Layout>
    )
}

function Section({title, description}){
    return(
        <div style={{marginBottom: "50px", paddingBottom: "30px", borderBottom: "1px solid #ccc", marginLeft: "10%", marginRight:"10%"}}>
            <h3 style={{fontSize: "26px", marginBottom: "10px", color: "#123568"}}>{title}</h3>
            <p style={{fontSize: "16px", marginBottom: "20px", color: "#7A6A62"}}>{description}</p>
            <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "15px"}}>
                {[1, 2, 3, 4].map((i) => (
                 <div key = {i} style={{backgroundColor: "#F5F5F0", borderRadius: "8px", height: "220px", border: "2px solid #E0D9D0", display: "flex", alignItems: "center", justifyContent: "center", COLOR: "#b0a599", fontSize:"14px"}}>
                    Okładka {i}
                 </div>   
                ))}
            </div>
        </div>
    );
}

function Step ({number, title, description}) {
    return(
        <div style={{textAlign: "center", backgroundColor: "#D4C9BE"}}>
            <div style={{width: "60px", height: "60px", borderRadius: "50%", backgroundColor: "#163555ff", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: "bold", margin: "0 auto 15px"}}>{number}</div>
            <h4 style={{fontSize: "20px", marginBottom: "10px", color: "#123568", backgroundColor: "#D4C9BE"}}>{title}</h4>
            <p style={{fontSize: "16px", color: "#7A6A62", backgroundColor: "#D4C9BE"}}>{description}</p>
        </div>
    );
}