import '../styles/pages/HomePage.css'
import { useState, useMemo, useRef } from 'react';
//todo Importiamo useNavigate per navigare programmaticamente tra le pagine (es: da card a Details)
import { useNavigate } from 'react-router-dom';
import heroVideoAnime from '../videos/video-hero-anime.mp4';
import heroVideoFilm from '../videos/video-hero-film.mp4';
//todo Importiamo i dati dei prodotti dal file JSON per popolare i caroselli
import productsData from '../JSON/products.json';
//todo Importiamo ProductCard componente unificato per le card prodotto
import ProductCard from '../components/common/ProductCard';


function HomePage() {

    // Stato per tracciare il video corrente
    const [currentVideoSrc, setCurrentVideoSrc] = useState(heroVideoAnime);
    
    //todo Stato per gestire le notifiche quando si aggiunge un prodotto al carrello
    const [notification, setNotification] = useState(null);
    
    //todo Funzione per mostrare notifiche temporanee (3 secondi)
    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification(null);
        }, 3000);
    };

    //todo Creiamo riferimenti (ref) per accedere direttamente agli elementi DOM dei caroselli
    //todo Questi ref vengono usati per controllare lo scroll orizzontale e gestire i touch events
    const bestSellersRef = useRef(null);
    const latestArrivalsRef = useRef(null);
    const promotionalProductsRef = useRef(null);

    //todo Inizializziamo useNavigate per permettere la navigazione tra le route
    const navigate = useNavigate();

    //todo useMemo memorizza il risultato della randomizzazione per evitare di rifare lo shuffle ad ogni render
    //todo Fisher-Yates shuffle: algoritmo per mescolare array in modo casuale
    const randomProducts = useMemo(() => {
        const shuffled = [...productsData];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor((i + 1) * 0.5);
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }, []);

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
    //todo Aggiungiamo originalIndex per mantenere il riferimento alla posizione originale nel JSON
    //todo Questo è necessario perché la navigazione a Details usa l'indice dell'array originale
    const bestSellers = randomProducts.slice(0, 12).map(product => ({
        ...product,
        originalIndex: productsData.findIndex(p => p.name === product.name)
    }));
    //todo Prendiamo i prodotti dal 12 al 23 (12 totali) per "Ultimi Arrivi"
    const latestArrivals = randomProducts.slice(12, 44).map(product => ({
        ...product,
        originalIndex: productsData.findIndex(p => p.name === product.name)
    }));
    
    //todo Filtriamo solo i prodotti che hanno uno sconto attivo per "Prodotti in Promozione"
    //todo Controlliamo che discount sia un numero maggiore di 0
    const promotionalProducts = productsData
        .filter(product => product.discount && typeof product.discount === 'number' && product.discount > 0)
        .map(product => ({
            ...product,
            originalIndex: productsData.findIndex(p => p.name === product.name)
        }));

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
    //todo Riceve lo slug generato da ProductCard e naviga a /details/:slug
    const handleViewDetails = (slug) => {
        navigate(`/details/${slug}`);
    };

    //todo Funzione per aggiungere prodotto al carrello dal carosello HomePage
    const handleAddToCart = (product) => {
        //todo Calcoliamo il prezzo finale considerando eventuali sconti
        const hasDiscount = product.discount && typeof product.discount === 'number' && product.discount > 0;
        const finalPrice = hasDiscount ? product.price * (1 - product.discount / 100) : product.price;
        
        //todo Recuperiamo il carrello da localStorage (o array vuoto se non esiste)
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        //todo Cerchiamo se il prodotto è già nel carrello confrontando per nome
        const existingItem = cart.find(item => item.name === product.name);
        
        //todo Se esiste già, incrementiamo la quantità
        if (existingItem) {
            existingItem.quantity += 1;
            showNotification(`Quantità di "${product.name}" aumentata nel carretto!`);
        } else {
            //todo Altrimenti aggiungiamo il nuovo prodotto con prezzo finale (scontato se applicabile) e quantità 1
            cart.push({ ...product, price: finalPrice, quantity: 1 });
            showNotification(`"${product.name}" aggiunto al carrello!`);
        }
        
        //todo Salviamo il carrello aggiornato in localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        //todo Dispatchamo eventi per sincronizzare il carrello
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('cartUpdate'));
    };


    return (
        <>
            {/* todo: Notifica quando si aggiunge un prodotto al carrello */}
            {notification && (
                <div className={`notification ${notification.type}`}>
                    <div className="notification-content">
                        <span className="notification-icon">
                            {notification.type === 'success' ? '✓' : 'ℹ'}
                        </span>
                        <span className="notification-message">{notification.message}</span>
                        <button 
                            className="notification-close"
                            onClick={() => setNotification(null)}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            <div className="homepage">

                {/*HERO SECTION*/}
                <section className="hero-section">
                <div className="hero-left">
                    <h1 className="hero-title">NEXT LEVEL: <br /> <span className='hero-title-purple'>REAL LIFE</span></h1>
                    <button 
                        className="btn-get-started"
                        onClick={() => {
                            document.querySelector('#prodotti')?.scrollIntoView({ 
                                behavior: 'smooth',
                                block: 'start'
                            });
                        }}
                    >
                        GET STARTED
                    </button>
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
            <section className="quests-section best-sellers-section-wrapper" id="prodotti">
                <h2 className="section-title" id="prodotti">Più Popolari</h2>

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
                        <ProductCard
                            key={index}
                            product={product}
                            badge="popular"
                            variant="carousel"
                            onViewDetails={handleViewDetails}
                            onAddToCart={handleAddToCart}
                        />
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
                        <ProductCard
                            key={index}
                            product={product}
                            badge="new"
                            variant="carousel"
                            onViewDetails={handleViewDetails}
                            onAddToCart={handleAddToCart}
                        />
                    ))}
                </div>

                {/*todo Pulsante freccia destra per scrollare Ultimi Arrivi*/}
                <button
                    className="scroll-btn scroll-right"
                    onClick={() => scrollCarousel(latestArrivalsRef, 1)}>
                    &gt;
                </button>
            </section>

            {/*PRODOTTI IN PROMOZIONE*/}
            {/*todo Mostriamo la sezione solo se ci sono prodotti in promozione*/}
            {promotionalProducts.length > 0 && (
                <section className="quests-section promotional-section-wrapper">
                    <h2 className="section-title">Prodotti in Promozione</h2>

                    {/*todo Pulsante freccia sinistra per il carosello Prodotti in Promozione*/}
                    <button
                        className="scroll-btn scroll-left"
                        onClick={() => scrollCarousel(promotionalProductsRef, -1)}>
                        &lt;
                    </button>

                    {/*todo Contenitore carosello Prodotti in Promozione con gestione touch*/}
                    <div 
                        ref={promotionalProductsRef}
                        className="cards-list promotional-products-list"
                        onTouchStart={(e) => handleTouchStart(e, promotionalProductsRef)}
                        onTouchMove={(e) => handleTouchMove(e, promotionalProductsRef)}
                        onTouchEnd={() => handleTouchEnd(promotionalProductsRef)}
                    >
                        {promotionalProducts.map((product, index) => (
                            <ProductCard
                                key={index}
                                product={product}
                                badge="sale"
                                variant="carousel"
                                onViewDetails={handleViewDetails}
                                onAddToCart={handleAddToCart}
                            />
                        ))}
                    </div>

                    {/*todo Pulsante freccia destra per scrollare Prodotti in Promozione*/}
                    <button
                        className="scroll-btn scroll-right"
                        onClick={() => scrollCarousel(promotionalProductsRef, 1)}>
                        &gt;
                    </button>
                </section>
            )}
        </div>
        </>
    );
}

export default HomePage;