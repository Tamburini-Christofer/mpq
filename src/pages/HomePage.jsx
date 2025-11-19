import './HomePage.css'
//todo Importiamo useState, useEffect (per chiamate API), useMemo e useRef
import { useState, useEffect, useMemo, useRef } from 'react';
//todo Importiamo useNavigate per navigare programmaticamente tra le pagine (es: da card a Details)
import { useNavigate
    
 } from 'react-router-dom';
import heroVideoAnime from '../videos/video-hero-anime.mp4';
import heroVideoFilm from '../videos/video-hero-film.mp4';
import axios from 'axios'


function HomePage() {

    //todo Stato per memorizzare i prodotti caricati dal backend
    const [productsData, setProductsData] = useState([]);
    //todo Stato per gestire il caricamento (mostra loader mentre recupera dati)
    const [loading, setLoading] = useState(true);
    //todo Stato per eventuali errori durante il caricamento
    const [error, setError] = useState(null);

    // Stato per tracciare il video corrente
    const [currentVideoSrc, setCurrentVideoSrc] = useState(heroVideoAnime);

    //todo Creiamo riferimenti (ref) per accedere direttamente agli elementi DOM dei caroselli
    //todo Questi ref vengono usati per controllare lo scroll orizzontale e gestire i touch events
    const bestSellersRef = useRef(null);
    const onSaleRef = useRef(null);  // Ref per il carosello promozioni
    const latestArrivalsRef = useRef(null);

    //todo Inizializziamo useNavigate per permettere la navigazione tra le route
    const navigate = useNavigate();

    //todo useEffect viene eseguito una sola volta all'avvio del componente (array dipendenze vuoto [])
    //todo Carica i prodotti dal backend tramite API
    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);

                // Chiamata axios GET ai prodotti
                const response = await axios.get('http://localhost:3000/products');


                if (Array.isArray(response.data)) {
                    // Se è un array di prodotti, lo settiamo direttamente nello stato
                    setProductsData(response.data);
                } else if (response.data) {
                    // Se il backend restituisce un singolo oggetto, lo mettiamo in un array
                    setProductsData([response.data]);
                } else {
                    // Se non ci sono dati, array vuoto
                    setProductsData([]);
                }

                setError(null);
            } catch (err) {
                console.error('Errore caricamento prodotti:', err);
                setError('Impossibile caricare i prodotti. Riprova più tardi.');
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, []);




    //todo useMemo memorizza il risultato della randomizzazione per evitare di rifare lo shuffle ad ogni render
    //todo Fisher-Yates shuffle: algoritmo per mescolare array in modo casuale
    //todo Ora dipende da productsData che viene caricato dal backend
    const randomProducts = useMemo(() => {
        //todo Se non ci sono prodotti, ritorna array vuoto
        if (!productsData || productsData.length === 0) return [];

        const shuffled = [...productsData];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor((i + 1) * 0.5);
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }, [productsData]);

    // FUNZIONE MODIFICATA PER IL LOOP
    const handleVideoEnd = () => {
        // Se il video corrente è l'Anime, passa al Film.
        if (currentVideoSrc === heroVideoAnime) {
            setCurrentVideoSrc(heroVideoFilm);
        }
        // Se il video corrente è il Film, torna all'Anime.
        else if (currentVideoSrc === heroVideoFilm) {
            setCurrentVideoSrc(heroVideoAnime);
        }
    };

    //todo Prendiamo i primi 12 prodotti randomizzati per "Più Popolari"

    //todo Usiamo l'ID dal database invece dell'indice dell'array
    const bestSellers = randomProducts.slice(0, 12);

    //todo Prendiamo i prodotti dal 12 al 44 (32 totali) per "Ultimi Arrivi"
    const latestArrivals = randomProducts.slice(12, 44);

    //todo Funzione per gestire lo scroll dei caroselli con le frecce sinistra/destra
    const scrollCarousel = (ref, direction) => {
        if (ref.current) {
            //todo Calcoliamo larghezza card e numero di card da scrollare in base alle dimensioni schermo
            //todo Mobile (<768px): scroll di 1 card da 200px, Desktop: scroll di 4 card da 270px
            const cardWidth = window.innerWidth < 768 ? 200 : 270;
            const cardsToScroll = window.innerWidth < 768 ? 1 : 4;
            const scrollAmount = cardWidth * cardsToScroll;

            //todo scrollBy con behavior:'smooth' crea un'animazione fluida dello scroll
            //todo direction è -1 per sinistra, +1 per destra
            ref.current.scrollBy({
                left: direction * scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    //todo Funzioni per gestire lo swipe (trascinamento) su dispositivi touch (tablet/smartphone)
    //todo handleTouchStart: salva la posizione iniziale del tocco e dello scroll
    const handleTouchStart = (e, ref) => {
        if (ref.current) {
            ref.current.touchStartX = e.touches[0].clientX;
            ref.current.scrollStartX = ref.current.scrollLeft;
        }
    };

    //todo handleTouchMove: durante il trascinamento, calcola la differenza e aggiorna lo scroll
    const handleTouchMove = (e, ref) => {
        if (!ref.current || !ref.current.touchStartX) return;

        const touch = e.touches[0];
        const diff = ref.current.touchStartX - touch.clientX;
        ref.current.scrollLeft = ref.current.scrollStartX + diff;
    };

    //todo handleTouchEnd: pulisce i valori salvati quando l'utente solleva il dito
    const handleTouchEnd = (ref) => {
        if (ref.current) {
            ref.current.touchStartX = null;
            ref.current.scrollStartX = null;
        }
    };

    //todo Funzione per navigare alla pagina dettagli del prodotto
    //todo Usiamo l'ID del database invece dell'indice array
    const handleViewDetails = (product) => {
        //todo Navighiamo usando l'ID univoco del prodotto dal database
        navigate(`/details/${product.slug}`);
    };

    //todo Funzione per aggiungere prodotto al carrello dal carosello HomePage
    const handleAddToCart = (product) => {
        //todo Recuperiamo il carrello da localStorage (o array vuoto se non esiste)
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        //todo Cerchiamo se il prodotto è già nel carrello confrontando per nome
        const existingItem = cart.find(item => item.name === product.name);

        //todo Se esiste già, incrementiamo la quantità
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            //todo Altrimenti aggiungiamo il nuovo prodotto con quantità 1
            cart.push({ ...product, quantity: 1 });
        }

        //todo Salviamo il carrello aggiornato in localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        //todo Dispatchamo evento storage per sincronizzare il carrello su tutte le pagine aperte
        window.dispatchEvent(new Event('storage'));
    };


    return (
        <div className="homepage">

            {/*todo Mostra loader mentre carica i prodotti dal backend*/}
            {loading && (
                <div className="loading-container">
                    <p>Caricamento prodotti...</p>
                </div>
            )}

            {/*todo Mostra messaggio di errore se il caricamento fallisce*/}
            {error && (
                <div className="error-container">
                    <p>{error}</p>
                </div>
            )}

            {/*BEST SELLERS*/}
            <section className="quests-section best-sellers-section-wrapper">
                <h2 className="section-title">Più Popolari</h2>

                {/*todo Pulsante freccia sinistra per scrollare il carosello indietro*/}
                <button
                    className="scroll-btn scroll-left"
                    onClick={() => scrollCarousel(bestSellersRef, -1)}>
                    &lt;
                </button>

                {/*todo Contenitore del carosello con ref per accesso diretto al DOM*/}
                {/*todo onTouchStart/Move/End: eventi per gestire lo swipe su dispositivi touch*/}
                <div 
                    ref={bestSellersRef}
                    className="cards-list best-sellers-list"
                    onTouchStart={(e) => handleTouchStart(e, bestSellersRef)}
                    onTouchMove={(e) => handleTouchMove(e, bestSellersRef)}
                    onTouchEnd={() => handleTouchEnd(bestSellersRef)}
                >
                    {bestSellers.map((product, index) => {
                        const hasDiscount = product.discount && product.discount > 0;
                        const discountedPrice = hasDiscount ? product.price * (1 - product.discount / 100) : product.price;
                        
                        return (
                        <div key={index} className={`card-placeholder ${hasDiscount ? 'promotion-card' : ''}`}>
                            {/*todo Mostra badge sconto se presente, altrimenti badge popolare*/}
                            {hasDiscount ? (
                                <span className="card-label card-label-sale">-{product.discount}%</span>
                            ) : (
                                <span className="card-label card-label-popular">POPOLARE</span>
                            )}
                            {/*todo Immagine del prodotto presa dal campo image del JSON*/}
                            <img src={product.image} alt={product.name} className="card-image" />
                            <div className="card-info">
                                {/*todo Nome del prodotto (max 2 righe con ellipsis)*/}
                                <h3 className="card-title">{product.name}</h3>
                                {/*todo Prezzi con gestione sconto*/}
                                {hasDiscount ? (
                                    <div className="price-section">
                                        <p className="card-price discounted">{discountedPrice.toFixed(2)}€</p>
                                        <p className="card-price original">{product.price.toFixed(2)}€</p>
                                    </div>
                                ) : (
                                    <p className="card-price">{product.price.toFixed(2)}€</p>
                                )}
                                <div className="card-buttons">
                                    {/*todo Pulsante oro per navigare alla pagina Details del prodotto*/}
                                    <button 
                                        className="card-btn card-btn-details"
                                        onClick={() => handleViewDetails(product)}
                                    >
                                        Dettagli
                                    </button>
                                    {/*todo Pulsante con bordo oro per aggiungere al carrello direttamente dalla HomePage*/}
                                    <button 
                                        className="card-btn card-btn-cart"
                                        onClick={() => handleAddToCart(product)}
                                    >
                                        Acquista
                                    </button>
                                </div>
                            </div>
                        </div>
                        );
                    })}
                </div>
            {/*todo Mostra contenuto solo se i prodotti sono caricati con successo*/}
            {!loading && !error && (
                <>
                    {/*HERO SECTION*/}
                    <section className="hero-section">                <div className="hero-left">
                        <h1 className="hero-title">NEXT LEVEL: <br /> <span className='hero-title-purple'>REAL LIFE</span></h1>
                        <button className="btn-get-started">GET STARTED</button>
                    </div>
                        <div className="hero-right">
                            {/* ELEMENTO VIDEO */}
                            <video
                                autoPlay
                                loop={false} // IMPORTANTE: Impostiamo loop su FALSE per entrambi
                                muted
                                playsInline
                                className="hero-video"
                                onEnded={handleVideoEnd} // Gestore di fine video
                                key={currentVideoSrc} // Aggiungi la key per forzare il ricaricamento
                                src={currentVideoSrc} // Sorgente dinamica
                                disablepictureinpicture
                            >
                                Il tuo browser non supporta il tag video.
                            </video>
                        </div>
                    </section>

                    {/*BEST SELLERS*/}
                    <section className="quests-section best-sellers-section-wrapper">
                        <h2 className="section-title">Più Popolari</h2>

            {/*PROMOZIONI*/}
            {onSaleProducts.length > 0 && (
                <section className="quests-section promotions-section-wrapper">
                    <h2 className="section-title">🔥 Offerte Speciali 🔥</h2>

                    {/*todo Pulsante freccia sinistra per il carosello promozioni*/}
                    <button
                        className="scroll-btn scroll-left"
                        onClick={() => scrollCarousel(onSaleRef, -1)}>
                        &lt;
                    </button>

                    {/*todo Contenitore carosello promozioni con gestione touch*/}
                    <div 
                        ref={onSaleRef}
                        className="cards-list promotions-list"
                        onTouchStart={(e) => handleTouchStart(e, onSaleRef)}
                        onTouchMove={(e) => handleTouchMove(e, onSaleRef)}
                        onTouchEnd={() => handleTouchEnd(onSaleRef)}
                    >
                        {onSaleProducts.map((product, index) => {
                            const discountedPrice = product.price * (1 - product.discount / 100);
                            return (
                                <div key={index} className="card-placeholder promotion-card">
                                    {/*todo Badge sconto*/}
                                    <span className="card-label card-label-sale">-{product.discount}%</span>
                                    {/*todo Immagine del prodotto*/}
                                    <img src={product.image} alt={product.name} className="card-image" />
                                    <div className="card-info">
                                        {/*todo Nome del prodotto*/}
                                        <h3 className="card-title">{product.name}</h3>
                                        {/*todo Prezzi scontato e originale*/}
                                        <div className="price-section">
                                            <p className="card-price discounted">{discountedPrice.toFixed(2)}€</p>
                                            <p className="card-price original">{product.price.toFixed(2)}€</p>
                                        </div>
                                        <div className="card-buttons">
                                            {/*todo Pulsante per vedere i dettagli*/}
                                            <button 
                                                className="card-btn card-btn-details"
                                                onClick={() => handleViewDetails(product)}
                                            >
                                                Dettagli
                                            </button>
                                            {/*todo Pulsante per aggiungere al carrello*/}
                                            <button 
                                                className="card-btn card-btn-cart"
                                                onClick={() => handleAddToCart(product)}
                                            >
                                                Acquista
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/*todo Pulsante freccia destra per scrollare le promozioni*/}
                    <button
                        className="scroll-btn scroll-right"
                        onClick={() => scrollCarousel(onSaleRef, 1)}>
                        &gt;
                    </button>
                </section>
            )}

            {/*LATEST ARRIVALS*/}
            <section className="quests-section latest-section-wrapper">
                <h2 className="section-title">Ultimi Arrivi</h2>

                        {/*todo Pulsante freccia sinistra per scrollare il carosello indietro*/}
                        <button
                            className="scroll-btn scroll-left"
                            onClick={() => scrollCarousel(bestSellersRef, -1)}>
                            &lt;
                        </button>

                        {/*todo Contenitore del carosello con ref per accesso diretto al DOM*/}
                        {/*todo onTouchStart/Move/End: eventi per gestire lo swipe su dispositivi touch*/}
                        <div
                            ref={bestSellersRef}
                            className="cards-list best-sellers-list"
                            onTouchStart={(e) => handleTouchStart(e, bestSellersRef)}
                            onTouchMove={(e) => handleTouchMove(e, bestSellersRef)}
                            onTouchEnd={() => handleTouchEnd(bestSellersRef)}
                        >
                            {bestSellers.map((product, index) => (
                                <div key={index} className="card-placeholder">
                                    {/*todo Label blu "POPOLARE" posizionata in alto a destra della card*/}
                                    <span className="card-label card-label-popular">POPOLARE</span>
                                    {/*todo Immagine del prodotto presa dal campo image del JSON*/}
                                    <img src={product.image} alt={product.name} className="card-image" />
                                    <div className="card-info">
                                        {/*todo Nome del prodotto (max 2 righe con ellipsis)*/}
                                        <h3 className="card-title">{product.name}</h3>
                                        {/*todo Prezzo formattato con 2 decimali*/}
                                        <p className="card-price">{product.price}€</p>
                                        <div className="card-buttons">
                                            {/*todo Pulsante oro per navigare alla pagina Details del prodotto*/}
                                            <button
                                                className="card-btn card-btn-details"
                                                onClick={() => navigate(`/details/${product.slug}`)}
                                            >
                                                Dettagli
                                            </button>
                                            {/*todo Pulsante con bordo oro per aggiungere al carrello direttamente dalla HomePage*/}
                                            <button
                                                className="card-btn card-btn-cart"
                                                onClick={() => handleAddToCart(product)}
                                            >
                                                Acquista
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/*todo Pulsante freccia destra per scrollare il carosello avanti*/}
                        <button
                            className="scroll-btn scroll-right"
                            onClick={() => scrollCarousel(bestSellersRef, 1)}>
                            &gt;
                        </button>
                    </section>

                    {/*LATEST ARRIVALS*/}
                    <section className="quests-section latest-section-wrapper">
                        <h2 className="section-title">Ultimi Arrivi</h2>

                        {/*todo Pulsante freccia sinistra per il carosello Ultimi Arrivi*/}
                        <button
                            className="scroll-btn scroll-left"
                            onClick={() => scrollCarousel(latestArrivalsRef, -1)}>
                            &lt;
                        </button>

                        {/*todo Contenitore carosello Latest Arrivals con gestione touch*/}
                        <div
                            ref={latestArrivalsRef}
                            className="cards-list latest-arrivals-list"
                            onTouchStart={(e) => handleTouchStart(e, latestArrivalsRef)}
                            onTouchMove={(e) => handleTouchMove(e, latestArrivalsRef)}
                            onTouchEnd={() => handleTouchEnd(latestArrivalsRef)}
                        >
                            {latestArrivals.map((product, index) => (
                                <div key={index} className="card-placeholder">
                                    {/*todo Label rossa "NUOVO ARRIVO" per distinguere dai prodotti popolari*/}
                                    <span className="card-label card-label-new">NUOVO ARRIVO</span>
                                    {/*todo Immagine del prodotto*/}
                                    <img src={product.image} alt={product.name} className="card-image" />
                                    <div className="card-info">
                                        {/*todo Nome del prodotto*/}
                                        <h3 className="card-title">{product.name}</h3>
                                        {/*todo Prezzo formattato*/}
                                        <p className="card-price">{product.price}€</p>
                                        <div className="card-buttons">
                                            {/*todo Pulsante per vedere i dettagli completi del prodotto*/}
                                            <button
                                                className="card-btn card-btn-details"
                                                onClick={() => handleViewDetails(product)}
                                            >
                                                Dettagli
                                            </button>
                                            {/*todo Pulsante per aggiungere il prodotto al carrello*/}
                                            <button
                                                className="card-btn card-btn-cart"
                                                onClick={() => handleAddToCart(product)}
                                            >
                                                Acquista
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/*todo Pulsante freccia destra per scrollare Ultimi Arrivi*/}
                        <button
                            className="scroll-btn scroll-right"
                            onClick={() => scrollCarousel(latestArrivalsRef, 1)}>
                            &gt;
                        </button>
                    </section>
                </>
            )}
        </div>
    );
}

export default HomePage;