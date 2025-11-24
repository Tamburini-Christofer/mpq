import '../styles/pages/HomePage.css'
import { useState, useMemo, useRef, useEffect } from 'react';
//todo Importiamo useNavigate per navigare programmaticamente tra le pagine (es: da card a Details)
import { useNavigate } from 'react-router-dom';
import heroVideoAnime from '../videos/video-hero-anime.mp4';
import heroVideoFilm from '../videos/video-hero-film.mp4';
//todo Importiamo le API per gestire prodotti e carrello
import { productsAPI, cartAPI, emitCartUpdate } from '../services/api';
import { toast } from 'react-hot-toast';
//todo Importiamo ProductCard componente unificato per le card prodotto
import ProductCard from '../components/common/ProductCard';


function HomePage() {

    // Stato per tracciare il video corrente
    const [currentVideoSrc, setCurrentVideoSrc] = useState(heroVideoAnime);
    
    // notifications via react-hot-toast
    
    const [cart, setCart] = useState([]);
    //todo Stato per i prodotti caricati dal backend
    const [productsData, setProductsData] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // using react-hot-toast: toast.success / toast.error

    //todo Creiamo riferimenti (ref) per accedere direttamente agli elementi DOM dei caroselli
    //todo Questi ref vengono usati per controllare lo scroll orizzontale e gestire i touch events
    const bestSellersRef = useRef(null);
    const latestArrivalsRef = useRef(null);
    const promotionalProductsRef = useRef(null);

    //todo Inizializziamo useNavigate per permettere la navigazione tra le route
    const navigate = useNavigate();

    // Carica il carrello
    const loadCart = async () => {
        try {
            const cartData = await cartAPI.get();
            setCart(cartData);
        } catch (error) {
            console.error("Errore caricamento carrello:", error);
        }
    };

    // Aggiungi listener per l'aggiornamento del carrello
    useEffect(() => {
        window.addEventListener('cartUpdate', loadCart);
        return () => window.removeEventListener('cartUpdate', loadCart);
    }, []);

    //todo Carica prodotti dal backend
    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);
                const data = await productsAPI.getAll();
                setProductsData(data);
                } catch (error) {
                console.error('Errore caricamento prodotti:', error);
                toast.error('Errore nel caricamento dei prodotti');
            } finally {
                setLoading(false);
            }
        };
        loadCart();
        loadProducts();
    }, []);

    // Autoplay più fluido e veloce con loop per i caroselli


    //todo useMemo memorizza il risultato della randomizzazione per evitare di rifare lo shuffle ad ogni render
    //todo Fisher-Yates shuffle: algoritmo per mescolare array in modo casuale
    const randomProducts = useMemo(() => {
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
            ref.current.isPaused = true; // pausa autoplay durante il drag
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
            // riprendi autoplay dopo breve delay
            setTimeout(() => {
                if (ref.current) ref.current.isPaused = false;
            }, 800);
        }
    };

    //todo Funzione per navigare alla pagina dettagli del prodotto
    //todo Riceve lo slug generato da ProductCard e naviga a /details/:slug
    const handleViewDetails = (slug) => {
        navigate(`/details/${slug}`);
    };

    //todo Funzione per aggiungere prodotto al carrello dal carosello HomePage
    const handleAddToCart = async (product) => {
        try {
            //todo Aggiungi prodotto via API
            await cartAPI.add(product.id, 1);
            
            //todo Emetti evento per aggiornare il contatore del carrello
            
            emitCartUpdate();
            
                // mostra toast di successo
                toast.success(`"${product.name}" aggiunto al carrello!`);
        } catch (error) {
            console.error('Errore aggiunta al carrello:', error);
                toast.error('Errore nell\'aggiunta al carretto');
        }
    };

    const handleIncrease = async (productId) => {
        try {
            await cartAPI.increase(productId);
            emitCartUpdate();
        } catch (error) {
            console.error("Errore nell'aumentare la quantità:", error);
            toast.error("Errore nell'aggiornamento del carrello");
        }
    };

    const handleDecrease = async (productId) => {
        try {
            const item = cart.find(i => i.id === productId);
            if (item && item.quantity > 1) {
                await cartAPI.decrease(productId);
            } else {
                await cartAPI.remove(productId);
            }
            emitCartUpdate();
        } catch (error) {
            console.error("Errore nel diminuire la quantità:", error);
            toast.error("Errore nell'aggiornamento del carrello");
        }
    };


    return (
        <>
            {/* todo: Notifica quando si aggiunge un prodotto al carrello */}
            

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
                        disablePictureInPicture
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
                    onClick={() => { if (bestSellersRef.current) bestSellersRef.current.isPaused = true; scrollCarousel(bestSellersRef, -1); setTimeout(() => { if (bestSellersRef.current) bestSellersRef.current.isPaused = false; }, 800); }}>
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
                    onMouseEnter={() => { if (bestSellersRef.current) bestSellersRef.current.isPaused = true; }}
                    onMouseLeave={() => { if (bestSellersRef.current) bestSellersRef.current.isPaused = false; }}
                >
                    {bestSellers.map((product, index) => (
                        <ProductCard
                            key={index}
                            product={product}
                            badge="popular"
                            variant="carousel"
                            cart={cart}
                            onViewDetails={handleViewDetails}
                            onAddToCart={handleAddToCart}
                            onIncrease={handleIncrease}
                            onDecrease={handleDecrease}
                            showActions={true}
                        />
                    ))}
                </div>

                {/*todo Pulsante freccia destra per scrollare il carosello avanti*/}
                <button
                    className="scroll-btn scroll-right"
                    onClick={() => { if (bestSellersRef.current) bestSellersRef.current.isPaused = true; scrollCarousel(bestSellersRef, 1); setTimeout(() => { if (bestSellersRef.current) bestSellersRef.current.isPaused = false; }, 800); }}>
                    &gt;
                </button>
            </section>

            {/*LATEST ARRIVALS*/}
            <section className="quests-section latest-section-wrapper">
                <h2 className="section-title">Ultimi Arrivi</h2>

                {/*todo Pulsante freccia sinistra per il carosello Ultimi Arrivi*/}
                <button
                    className="scroll-btn scroll-left"
                    onClick={() => { if (latestArrivalsRef.current) latestArrivalsRef.current.isPaused = true; scrollCarousel(latestArrivalsRef, -1); setTimeout(() => { if (latestArrivalsRef.current) latestArrivalsRef.current.isPaused = false; }, 800); }}>
                    &lt;
                </button>

                {/*todo Contenitore carosello Latest Arrivals con gestione touch*/}
                <div 
                    ref={latestArrivalsRef}
                    className="cards-list latest-arrivals-list"
                    onTouchStart={(e) => handleTouchStart(e, latestArrivalsRef)}
                    onTouchMove={(e) => handleTouchMove(e, latestArrivalsRef)}
                    onTouchEnd={() => handleTouchEnd(latestArrivalsRef)}
                    onMouseEnter={() => { if (latestArrivalsRef.current) latestArrivalsRef.current.isPaused = true; }}
                    onMouseLeave={() => { if (latestArrivalsRef.current) latestArrivalsRef.current.isPaused = false; }}
                >
                    {latestArrivals.map((product, index) => (
                        <ProductCard
                            key={index}
                            product={product}
                            badge="new"
                            variant="carousel"
                            cart={cart}
                            onViewDetails={handleViewDetails}
                            onAddToCart={handleAddToCart}
                            onIncrease={handleIncrease}
                            onDecrease={handleDecrease}
                            showActions={true}
                        />
                    ))}
                </div>

                {/*todo Pulsante freccia destra per scrollare Ultimi Arrivi*/}
                <button
                    className="scroll-btn scroll-right"
                    onClick={() => { if (latestArrivalsRef.current) latestArrivalsRef.current.isPaused = true; scrollCarousel(latestArrivalsRef, 1); setTimeout(() => { if (latestArrivalsRef.current) latestArrivalsRef.current.isPaused = false; }, 800); }}>
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
                        onClick={() => { if (promotionalProductsRef.current) promotionalProductsRef.current.isPaused = true; scrollCarousel(promotionalProductsRef, -1); setTimeout(() => { if (promotionalProductsRef.current) promotionalProductsRef.current.isPaused = false; }, 800); }}>
                        &lt;
                    </button>

                    {/*todo Contenitore carosello Prodotti in Promozione con gestione touch*/}
                    <div 
                        ref={promotionalProductsRef}
                        className="cards-list promotional-products-list"
                        onTouchStart={(e) => handleTouchStart(e, promotionalProductsRef)}
                        onTouchMove={(e) => handleTouchMove(e, promotionalProductsRef)}
                        onTouchEnd={() => handleTouchEnd(promotionalProductsRef)}
                        onMouseEnter={() => { if (promotionalProductsRef.current) promotionalProductsRef.current.isPaused = true; }}
                        onMouseLeave={() => { if (promotionalProductsRef.current) promotionalProductsRef.current.isPaused = false; }}
                    >
                        {promotionalProducts.map((product, index) => (
                            <ProductCard
                                key={index}
                                product={product}
                                badge="sale"
                                variant="carousel"
                                cart={cart}
                                onViewDetails={handleViewDetails}
                                onAddToCart={handleAddToCart}
                                onIncrease={handleIncrease}
                                onDecrease={handleDecrease}
                                showActions={true}
                            />
                        ))}
                    </div>

                    {/*todo Pulsante freccia destra per scrollare Prodotti in Promozione*/}
                    <button
                        className="scroll-btn scroll-right"
                        onClick={() => { if (promotionalProductsRef.current) promotionalProductsRef.current.isPaused = true; scrollCarousel(promotionalProductsRef, 1); setTimeout(() => { if (promotionalProductsRef.current) promotionalProductsRef.current.isPaused = false; }, 800); }}>
                        &gt;
                    </button>
                </section>
            )}
        </div>
        </>
    );
}

export default HomePage;