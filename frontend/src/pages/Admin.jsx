import { load } from "cheerio";
import React, { useState, useEffect} from "react";
import Layout from "../components/Layout";

export default function Admin(){
    const [activeTab, setActiveTab] = useState('add')
    const [books, setBooks] = useState([]);
    const [title, setTitle] = useState("");
    const [authors, setAuthors] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [scrapedBook, setScrapedBook] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if(activeTab === "manage"){
            loadBooks();
        }
    }, [activeTab])

    const loadBooks = async() => {
        try{
            const response = await fetch(`/admin/books?search=${searchQuery}`, {
                credentials: "include"
            });
            const data = await response.json()
            setBooks(data.books || []);
        }catch(err){
            console.error(err);
        }
    };

    const scrapeBook = async () => {
        setLoading(true);
        setMessage(null);
        setScrapedBook(null);

        try{
            const response = await fetch("/admin/scrape_book", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({title: title, authors: authors})
            });
            const data = await response.json();

            if(!response.ok){
                setMessage({type: "error", text: data.error || "Błąd"});
                return;
            }
            setScrapedBook(data.book);
            setMessage({type: "info", text: "Sprawdż dane i zatwierdź dodanie książki"});
            setTitle("");
            setAuthors("");
        }catch(err){
            console.error(err)
            setMessage({type: "error", text: "Błąd serwera"});
        } finally {
            setLoading(false);
        }
    }

    const deleteBook = async(bookId) => {
/*         if(!confirm(`Czy na pewno chcesz usunąć tę książkę?`)) return; */
        try{
            const response = await fetch(`/admin/books/${bookId}`, {
                method: "DELETE",
                credentials: "include"
            });
            if(response.ok){
                setMessage({ type: "success", text: "Książka usunięta"});
                loadBooks();
            }
        } catch(err){
            console.error(err);
        }
    }

    return(
        <Layout pageTitle="Panel administratora">
            <div style={{ 
                maxWidth: "1400px",
                margin: "0 auto",
                padding: "0 20px 40px"
            }}>
                <div style={{
                    display: "flex",
                    gap: "10px",
                    marginBottom: "30px",
                    borderBottom: "2px solid #E0D9D0"
                }}>
                    <Tab 
                        active={activeTab === 'add'}
                        onClick={() => setActiveTab('add')}
                        icon="+"
                        label="Dodaj książkę"
                        />
                    <Tab 
                        active={activeTab==='manage'}
                        onClick={() => setActiveTab('manage')}
                        icon="※"
                        label={`Zarządzaj (${books.length})`}
                        />
                </div>

                {message && (
                    <Message type={message.type} text={message.text} onClose={() => setMessage(null)} />
                )}

                {activeTab === 'add' && (
                    <div>
                        <AddBookForm
                            title={title}
                            authors={authors}
                            setTitle={setTitle}
                            setAuthors={setAuthors}
                            onSubmit={scrapeBook}
                            />

                        {scrapedBook && <BookPreview book={scrapedBook} setMessage={setMessage} setScrapedBook={setScrapedBook} />}
                        </div>
                )}

                {activeTab === 'manage' && (
                    <div>
                        <SearchBar 
                            value = {searchQuery}
                            onChange={setSearchQuery}
                            onSearch={loadBooks}
                            />
                        <BooksList
                            books={books}
                            onDelete={deleteBook}
                            />  
                        </div>
                )}

            </div>
        </Layout>
    )
}

function Tab({active, onClick, icon, label}) {
    return(
        <button
            onClick={onClick}
            style={{
                padding: "15px 30px",
                backgroundColor: active ? '#D4C9BE' : 'transparent',
                border: "none",
                borderBottom: active ? '3px solid #5A4A42' : "none",
                fontSize: "16px",
                color: "#5A4A42",
                cursor: "pointer",
                borderRadius: "8px 8px 0 0",
/*                 textAlign: "center",
                justifyContent: "center" */
            }}
            >
                {icon} {label}
            </button>
    )
}

function Message({type, text, onClose}) {
    return(
        <div style={{
            backgroundColor: type === 'success' ? '#D4EDDA' : '#FFE4E1',
            color: type === 'success' ? '#155724' : '#8B0000',
            padding: "15px 20px",
            borderRadius: "8px",
            marginBottom: "20px",
            border: `2px solid ${type==='success' ? '#C3E6CB' : '#FFB6C1'}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
        }}>
            <span> {type=== 'success' ? '✓' : '⚠️'} {text} </span>
            <button 
                onClick={onClose} 
                style={{
                    background: "none",
                    border: "none",
                    fontSize: "20px",
                    cursor: "pointer",
                    color: "inherit"
                }}>x</button>
        </div>
    )
}

function AddBookForm({title, authors, setTitle, setAuthors, loading, onSubmit}){
    return(
        <>
        <div style={{
            backgroundColor: "#F9F7F4",
            padding: "40px",
            borderRadius: "15px",
            border: "2px solid #E0D9D0",
            marginBottom: "30px"
        }}>
            <h3 style={{ fontSize: "24px", color: "#5A4A42", marginBottom: "15px"}}>
                Dodaj książkę
            </h3>
        </div>
        

            <div style={{
                display: "flex",
                gap: "15px",
                marginBottom: "15px"
            }}>
                <input 
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyPress={(e) => e.key==='Enter' && onSubmit()}
                    placeholder="Tytuł książki..."
                    disabled={loading}
                    style={{
                        flex:1,
                        padding: "15px 20px",
                        fontSize: "16px",
                        border: "2px solid #D4C9BE",
                        borderRadius: "12px",
                        outline: "none"
                    }}
                />

                <input 
                    type="text"
                    value={authors}
                    onChange={(e) => setAuthors(e.target.value)}
                    onKeyPress={(e) => e.key==='Enter' && onSubmit()}
                    placeholder="Autor książki..."
                    disabled={loading}
                    style={{
                        flex:1,
                        padding: "15px 20px",
                        fontSize: "16px",
                        border: "2px solid #D4C9BE",
                        borderRadius: "12px",
                        outline: "none"
                    }}
                />
                <button
                    onClick={onSubmit}
                    onKeyPress={(e) => e.key === 'Enter' && onSubmit()}
                    style={{
                        padding: "15px 40px",
                        backgroundColor: loading ? '#B8ADA3': '#5A4A42',
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "16px",
                        fontWeight: "600",
                    }}
                    onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor= "#72625aff";
                        }
                    }
                    onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor= "#5A4A42";
                        }
                    }
                    >
                        {loading ? "Przetwarzanie..." : "+ Dodaj książkę"}
                    </button>
            </div>  
        </>
    )
}

function BookPreview({book, setMessage, setScrapedBook}){
    return(
        <>
        <div style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "15px",
            border: "2px solid #aecaaeff"
        }}>
            <h3 style={{fontSize: "20px", color: "#aecaaeff", marginBottom: "20px"}}>
                Szczegóły książki, którą chcesz dodać do bazy
            </h3>
            <div style={{
                display:"grid",
                gridTemplateColumns: "150px 1fr",
                gap: "20px"
            }}>
                {book.coverImage && (
                    <img 
                        src={book.coverImage}
                        alt={book.title}
                        style={{
                            width: "100%",
                            borderRadius: "8px",
                            border: "2px solid #E0D9D0"
                        }}
                        />
                )}
                <div>
                    <h4 style={{ 
                        fontSize: "23px", 
                        marginBottom: "12px",
                        color: "#5A4A42"
                    }}>
                        {book.title}
                    </h4>
                    <p style={{
                        color: "#7A6A62",
                        marginBottom: "10px"
                    }}>
                        {book.authors?.map(a => a.name).join(", ")}
                    </p>
                    <p style={{
                        color: "#7A6A62",
                        marginBottom: "10px",
                    }}> <span style={{ fontWeight: "800"}}> Kategorie: </span>
                        {book.category ?? "Brak"}
                    </p>
                    <p style={{
                        color: "#7A6A62",
                        marginBottom: "10px",
                    }}> <span style={{ fontWeight: "800"}}> Wydawnictwo: </span>
                        {book.publisher ?? "Brak"}
                    </p>
                    <p style={{
                        color: "#7A6A62",
                        marginBottom: "10px",
                    }}> <span style={{ fontWeight: "800"}}> Data wydania: </span>
                        {book.releaseDate ?? "Brak"}
                    </p>
                    <p style={{
                        color: "#7A6A62",
                        marginBottom: "10px",
                    }}> <span style={{ fontWeight: "800"}}> ISBN: </span>
                        {book.isbn ?? "Brak"}
                    </p>
                    <p style={{
                        color: "#7A6A62",
                        marginBottom: "10px",
                    }}> <span style={{ fontWeight: "800"}}> Liczba stron: </span>
                        {book.pages != null ? `${book.pages}+str.` : "Brak"}
                    </p>
                    <p style={{
                        color: "#7A6A62",
                        marginBottom: "10px",
                    }}> <span style={{ fontWeight: "800"}}> Ocena: </span>
                        {book.rating ?? "Brak"}
                    </p>
                    <p style={{
                        color: "#7A6A62",
                        marginBottom: "10px",
                    }}> <span style={{ fontWeight: "800"}}> Liczba ocen: </span>
                        {book.ratingsCount ?? "Brak"}
                    </p>
                    <p style={{
                        color: "#7A6A62",
                        marginBottom: "10px",
                    }}> <span style={{ fontWeight: "800"}}> URL: </span>
                        {book.url ?? "Brak"}
                    </p>
                    <p style={{
                        color: "#7A6A62",
                        marginBottom: "10px",
                    }}> <span style={{ fontWeight: "800"}}> Opis: </span>
                        {book.longDescription ?? "Brak"}
                    </p>
                    <hr sytle={{
                        border: "none",
                        borderTop: "2 solid #E0D9D0",
                        width: "6vw",
                        margin: "12px auto"
                    }}></hr>
                    <h4 style={{ 
                        fontSize: "23px", 
                        marginBottom: "12px",
                        color: "#5A4A42"
                    }}>
                        Recenzje
                    </h4>
                    <p style={{
                        color: "#7A6A62",
                        marginBottom: "10px",
                    }}> <span style={{ fontWeight: "800"}}> Liczba recenzji: </span>
                        {book.reviews.length}
                    </p>
                    {book.reviews.map(rev => {
                        <div style={{
                            backgroundColor: "#FAF8F6",
                            borderRadius: "12px",
                            padding: "16px",
                            marginBottom: "16px",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
                        }}>
                            <p style={{
                                color: "#7A6A62",
                                marginBottom: "10px",
                            }}> <span style={{ fontWeight: "800"}}> Autor: </span>
                                {rev.author}
                            </p>
                            <p style={{
                                color: "#7A6A62",
                                marginBottom: "10px",
                            }}> <span style={{ fontWeight: "800"}}> Ocena: </span>
                                ⭐ {rev.rating}/10
                            </p>
                            <p style={{
                                color: "#7A6A62",
                                marginBottom: "10px",
                            }}> <span style={{ fontWeight: "800"}}> Tekst: </span>
                                {rev.text}
                            </p>
                            <p style={{
                                color: "#7A6A62",
                                marginBottom: "10px",
                            }}> <span style={{ fontWeight: "800"}}> Data: </span>
                                {rev.author}
                            </p>
                            <div style={{
                                display: "flex",
                                gap: "8px",
                                flexWrap: "wrap"
                            }}>
                                {rev.emotions?.map((emotion, i) => (
                                    <span
                                        key={i}
                                        style={{
                                            backgroundColor: "#FFB6C1",
                                            padding: "6px 12px",
                                            borderRadius: "15px",
                                            fontSize: "13px",
                                            color: "#5A4A42",
                                            fontWeight: 600
                                        }}>
                                            {emotion}
                                        </span>
                                ))}
                            </div>
                        </div>
                    })}
                    <div style={{
                        display: "flex",
                        gap: "8px",
                        flexWrap: "wrap"
                    }}>
                        {book.dominant_emotion?.map((emotion, i) => (
                            <span
                                key={i}
                                style={{
                                    backgroundColor: "#FFB6C1",
                                    padding: "6px 12px",
                                    borderRadius: "15px",
                                    fontSize: "13px",
                                    color: "#5A4A42",
                                    fontWeight: 600
                                }}>
                                    {emotion}
                                </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
        
            <button
                style={{
                    padding: "15px 30px",
                    backgroundColor: '#D4C9BE',
                    border: "none",
                    fontSize: "16px",
                    color: "#5A4A42",
                    cursor: "pointer",
                    borderRadius: "8px",
                    marginTop: "20px",
                    marginLeft: "38%"
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor= "#dac2a9ff'";
                    }
                }
                onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor= "#99622bff'";
                    }
                }
                onClick = {async () => {
                    const res = await fetch("admin/scrape_confirm", {
                        method: "POST",
                        credentials: "include",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({ book })
                    });
                    const data = await res.json();
                    if(res.ok){
                        setMessage({ type: "success", text: "Książka zapisana w bazie"});
                        setScrapedBook(null);
                    } else {
                        setMessage({type: "error", text: data.error});
                    }
                    
                }}>
                    Zatwierdź dodanie
                </button>
            </>
    )
}

 function SearchBar({value, onChange, onSearch}) {
    return(
        <div style={{
            display: "flex",
            gap: "15px",
            marginBottom: "25px"
        }}>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)} 
                onKeyPress={(e) => e.key === 'Enter' && onSearch()}
                placeholder="Szukaj po tytule lub autorze..."
                style={{
                    flex:1,
                    padding: "12px 20px",
                    fontSize: "15px",
                    border: "2px solid #D4C9BE",
                    borderRadius: "10px",
                    outline: "none"
                }}
            />
            <button 
                onClick={onSearch}
                style={{
                    padding: "12px 30px",
                    backgroundColor: "#5A4A42",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontWeight: "600"
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor= "#8f7669ff";
                    }
                }
                onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor= "#5A4A42";
                    }
                }
                    > Szukaj</button>
        </div>
    )
}

function BooksList({ books, onDelete}){
    if(books.length === 0){
        return(
            <div style={{
                textAlign: "center",
                padding: "60px",
                backgroundColor: "#F9F7F4",
                borderRadius: "8px",
                border: "2px dashed #E0D9D0"
            }}>
                <div style={{ fontSize: "64px", marginBottom: "20px"}}>📚</div>
                <p style={{fontSize: "18px", color: "#7A6A62"}}>
                    Brak książek
                </p>
            </div>
        )
    }
    return(
        <div style={{
            display: "grid",
            gap: "20px"
        }}>
            {books.map(book => (
                <BookRow
                    key={book._id}
                    book={book}
                    onDelete={() => onDelete(book._id.$oid/*  || book._id */)}
                    />
            ))}
        </div>
    )
}

function BookRow({book, onDelete}){
    return(
        <div style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "12px",
            border: "2px solid #E0D9D0",
            display: "grid",
            gridTemplateColumns: "80px 1fr auto",
            gap: "20px",
            alignItems: "center"
        }}
        onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor= "#ccc1b2ff";
            }
        }
        onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor= "white";
            }
        }
        >
            {book.coverImage && (
                <img
                    src={book.coverImage}
                    alt={book.title}
                    style={{
                        width: "80px",
                        borderRadius: "6px",
                        border: "1px solid #E0D9D0"
                    }}
                />
            )}
            <div>
                <h4 style={{
                    fontSize: "16px",
                    marginBottom: "5px",
                    color: "#5A4A42"
                }}>
                    {book.title}
                </h4>
                <p style={{
                    fontSize: "14px",
                    color: "#7A6A62",
                    marginBottom: "10px"
                }}>
                    {book.authors?.map(a=>a.name).join(", ")}
                </p>

                <div style={{
                    display: "flex",
                    gap: "6px",
                    flexWrap: "wrap"
                }}>
                    {book.dominant_emotion?.map((e, i) => (
                        <span key={i} style={{
                            backgroundColor: "#E6E6FA",
                            padding: "4px 10px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            color: "#5A4A42"
                        }}>
                            {e}
                        </span>
                    ))}
                </div>
            </div>

            <div style={{
                display: "flex",
                gap: "10px"
            }}>
                <button
                    onClick={onDelete}
                    style={{
                        padding: "8px 16px",
                        backgroundColor: "#FF6B6B",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "14px"
                    }}
                    onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor= "#da2b2bff";
                        }
                    }
                    onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor= "#FF6B6B";
                        }
                    }
                    >
                        Usuń
                    </button>
            </div>
        </div>
    )
}
