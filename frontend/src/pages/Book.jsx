import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import Layout from "../components/Layout"

export default function Book(){

    const { id } = useParams();
    const [book, setBook] = useState(null);

    useEffect(() =>{
        fetch(`/main/book?id=${id}`)
        .then((res)=>res.json())
        .then((data) => setBook(data))
        .catch((err)=>console.error(err))
    }, [id]);

    console.debug(id);

    if(!book) return <Layout pageTitle = "Ładowanie..."></Layout>  ;

    return(
<Layout pageTitle = {book.Title}>

    <div style={{display: "flex"}}>
    <input type="image" src={book.image} style={{width: "10%", height: "10%", marginTop: "1vw", position: "relative", left: "30vw", float: "left"}} ></input>    
    <div className = "book-details">
        <span style={{fontWeight: "bold"}}>Autor: </span>{ String(book.authors).replace(/\[/g, '').replace(/\]/g, '').replace(/'/g, '') }<br/><br/>
        <span style={{fontWeight: "bold"}}>Wydawnictwo: </span>{ book.publisher } <br/><br/>
        <span style={{fontWeight: "bold"}}>Kategoria: </span>{String(book.categories).replace(/\[/g, '').replace(/\]/g, '').replace(/'/g, '') }<br/><br/>
        <span style={{fontWeight: "bold"}}>Ocena: </span>{ book.ratingsCount } <br/><br/>
        <span style={{fontWeight: "bold"}}>Data wydania: </span>{ book.publishedDate ? (typeof book.publishedDate === 'object' && book.publishedDate.$date ? new Date(book.publishedDate.$date).toLocaleDateString() : book.publishedDate) : 'Brak daty'} <br/><br/>
        <span style={{fontWeight: "bold"}}>Opis fabuły: </span><div/><br/>
{/*         <div style={{width: "40vw", marginLeft: "33%"}}> */}
            { book.description }
{/*         </div> */}
    </div>
    </div>
</Layout>  
    )
}