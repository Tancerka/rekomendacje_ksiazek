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
<Layout pageTitle = {book.title}>

    <div style={{display: "flex"}}>
    <input type="image" src={book.coverImage} style={{width: "10%", height: "10%", marginTop: "3vw", position: "relative", left: "30vw", float: "left"}} ></input>    
    <div className = "book-details">
        <span style={{fontWeight: "bold"}}>Autor: </span>{ String(book.authors.map(author=> author.name)).replace(/\[/g, '').replace(/\]/g, '').replace(/'/g, '') }<br/><br/>
        <span style={{fontWeight: "bold"}}>Wydawnictwo: </span>{ book.publisher } <br/><br/>
        <span style={{fontWeight: "bold"}}>Kategoria: </span>{String(book.category).replace(/\[/g, '').replace(/\]/g, '').replace(/'/g, '') }<br/><br/>
        <span style={{fontWeight: "bold"}}>Ilość stron: </span>{ book.pages } <br/><br/>
        <span style={{fontWeight: "bold"}}>Ocena: </span>{ book.rating} <br/><br/>
        <span style={{fontWeight: "bold"}}>Ilość ocen: </span>{ book.ratingsCount } <br/><br/>
        <span style={{fontWeight: "bold"}}>Data wydania: </span>{ book.releaseDate ? (typeof book.releaseDate === 'object' && book.releaseDate.$date ? new Date(book.releaseDate.$date).toLocaleDateString() : book.releaseDate) : 'Brak daty'} <br/><br/>
        <span style={{fontWeight: "bold"}}>Opis fabuły: </span><div/><br/>
{/*         <div style={{width: "40vw", marginLeft: "33%"}}> */}
            { book.longDescription }
{/*         </div> */}
    </div>
    </div>
</Layout>  
    )
}