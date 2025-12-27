import { load } from "cheerio";
import React, { useState, useEffect} from "react";
import Layout from "../components/Layout";

export default function Admin(){
    const [activeTab, setActiveTab] = useState('add')
    const [books, setBooks] = useState([]);
    const [url, setUrl] = useState("");
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
                            loading={setUrl}
                            onSubmit={scrapeBook}
                            />

                        {scrapedBook && <BookPreview book={scrapedBook} />}
                        </div>
                )}

                {activeTab === 'manage' && (
                    <div>
{/*                         <SearchBar 
                            value = {searchQuery}
                            onChange={setSearchQuery}
                            onSearch={loadBooks}
                            />
                        <BooksList
                            books={books}
                            onDelete={deleteBook}
                            /> */}
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
                onClick={onClose} style={{
                    background: "none",
                    border: "none",
                    fontSize: "20px",
                    cursor: "pointer",
                    color: "inherit"
                }}>x</button>
        </div>
    )
}

function AddBookForm({url, setUrl, loading, onSubmit}){
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
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
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
                <button
                    onClick={onSubmit}
                    disabled={loading || !url.trim()}
                    style={{
                        padding: "15px 40px",
                        backgroundColor: loading ? '#B8ADA3': '#5A4A42',
                        color: "white",
                        border: "none",
                        borderRadius: "12px",
                        fontSize: "16px",
                        fontWeight: "600",
                        cursor: loading || !url.trim() ? 'not-allowed': 'pointer'
                    }}>
                        {loading ? "Przetwarzanie..." : "+ Dodaj książkę"}
                    </button>
            </div>  
        </>
    )
}

function BookPreview({book}){
    return(
        <div style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "15px",
            border: "2px solid #aecaaeff"
        }}>
            <h3 style={{fontSize: "20px", color: "#aecaaeff", marginBottom: "20px"}}>
                Książka dodana do bazy
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
                        fontSize: "18px", 
                        marginBottom: "10px",
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
    )
}

