import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import Layout from "../components/Layout"

export default function Book(){

    const { id } = useParams();
    const [book, setBook] = useState(null);

    useEffect(() =>{

        fetch(`/main/book/${id}`)
        .then((res)=>res.json())
        .then((data) => setBook(data))
        .catch((err)=>console.error(err))
    }, [id]);

    if(!book) return <Layout pageTitle = "Ładowanie..."></Layout>  ;

    return(
<Layout pageTitle = "Strona główna">    
    <div className = "book-details">
        <span style={{fontWeight: "bold"}}>Autor: </span>{ book.authors } <br><br></br></br>
        <span style={{fontWeight: "bold"}}>Wydawnictwo: </span>{ book.publisher } <br><br></br></br>
        <span style={{fontWeight: "bold"}}>Kategoria: </span>{ book.categories } <br><br></br></br>
        <span style={{fontWeight: "bold"}}>Ocena: </span>{ book.Score } <br><br></br></br>
        <span style={{fontWeight: "bold"}}>Liczba ocen: </span>{ book.AmountOfScores } <br><br></br></br>
        <span style={{fontWeight: "bold"}}>Liczba stron: </span>{ book.Pages } <br><br></br></br>
    </div>
</Layout>  
    )
}