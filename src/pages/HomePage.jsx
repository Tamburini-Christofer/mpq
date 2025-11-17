import './HomePage.css'
import heroVideo from '../videos/video-for-hero.mp4';

const questData = [
    {
        id: 1,
        title: 'Hawkins Adventure',
        imageUrl: '/img',
        price: '$19.99',
        isNew: false,
        isBestSeller: true,
    },
    {
        id: 2,
        title: 'Hogwarts Legacy',
        imageUrl: '/img',
        price: '$19.99',
        isNew: true,
        isBestSeller: false,
    },
    {
        id: 3,
        title: 'Fuggi dal SottoSopra',
        imageUrl: '/img',
        price: '$24.99',
        isNew: true,
        isBestSeller: false,
    },
    {
        id: 4,
        title: 'Esame da Hunter',
        imageUrl: '/img',
        price: '$19.99',
        isNew: false,
        isBestSeller: true,
    },
    {
        id: 5,
        title: "Salva Ace da Marineford",
        imageUrl: '/img',
        price: '$24.99',
        isNew: false,
        isBestSeller: true,
    },
    {
        id: 6,
        title: 'Trasformati in Super Sayan',
        imageUrl: '/img',
        price: '$24.99',
        isNew: false,
        isBestSeller: true,
    },
    {
        id: 7,
        title: "Supera l'esame Chinun",
        imageUrl: '/img',
        price: '$24.99',
        isNew: false,
        isBestSeller: true,
    },
    {
        id: 8,
        title: "Getta l'anello nel monte Fato",
        imageUrl: '/img',
        price: '$24.99',
        isNew: true,
        isBestSeller: true,
    },
    {
        id: 9,
        title: "Sopravvivi al gigante corazzato",
        imageUrl: '/img',
        price: '$24.99',
        isNew: true,
        isBestSeller: true,
    },
    {
        id: 10,
        title: "Combatti tuo padre",
        imageUrl: '/img',
        price: '$19.99',
        isNew: false,
        isBestSeller: true,
    },
    {
        id: 11,
        title: "Guida un aereo a New York",
        imageUrl: '/img',
        price: '$49.99',
        isNew: true,
        isBestSeller: true,
    },
    {
        id: 12,
        title: "Sopravvivi a Roma Termini",
        imageUrl: '/img',
        price: '$24.99',
        isNew: true,
        isBestSeller: false,
    },
];


function HomePage() {

    const latestArrivals = questData.filter(quest => quest.isNew);
    const bestSellers = questData.filter(quest => quest.isBestSeller);

    const scrollListById = (id, direction) => {
        // 1. Troviamo l'elemento DOM usando l'ID
        const listElement = document.getElementById(id); 

        // 2. Controlliamo che l'elemento sia stato trovato
        if (listElement) { 
            // Larghezza di scorrimento (4 card * 270px)
            const scrollAmount = 4 * 270; 
            
            // 3. Eseguiamo lo scorrimento
            listElement.scrollBy({
                left: direction * scrollAmount,
                behavior: 'smooth'
            });
        } else {
            // Utile per il debug se l'ID non viene trovato
            console.error(`Elemento non trovato con ID: ${id}`);
        }
    };


    return (
        <div className="homepage">

            {/*HERO SECTION*/}
            <section className="hero-section">
                <div className="hero-left">
                    <h1 className="hero-title">NEXT LEVEL: <br /> <span className='hero-title-purple'>REAL LIFE</span></h1>
                    <button className="btn-get-started">GET STARTED</button>
                </div>
                <div className="hero-right">
                    {/* Placeholder */}
                    {/* ELEMENTO VIDEO */}
                <video 
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    className="hero-video" 
                >
                    {/* UTILIZZO DELLA VARIABILE IMPORTATA */}
                    <source src={heroVideo} type="video/mp4" />
                    Il tuo browser non supporta il tag video.
                </video>
                </div>
            </section>

            {/*BEST SELLERS*/}
            <section className="quests-section best-sellers-section-wrapper">
                <h2 className="section-title">Più Popolari</h2>

                {/* Pulsante Sinistra */}
                <button
                    className="scroll-btn scroll-left"
                    onClick={() => scrollListById('bestsellers-list', -1)}>
                    &lt;
                </button>

                {/* Assegniamo l'ID 'bestsellers-list' al contenitore */}
                <div id="bestsellers-list" className="cards-list best-sellers-list">
                    {bestSellers.map((quest) => (
                        <div key={quest.id} className="card-placeholder">
                            {quest.title} <br /> {quest.price}
                        </div>
                    ))}
                </div>

                {/* Pulsante Destra */}
                <button
                    className="scroll-btn scroll-right"
                    onClick={() => scrollListById('bestsellers-list', 1)}>
                    &gt;
                </button>
            </section>

            {/*LATEST ARRIVALS*/}
            <section className="quests-section latest-section-wrapper">
                <h2 className="section-title">Ultimi Arrivi</h2>

                {/* Pulsante Sinistra */}
                <button
                    className="scroll-btn scroll-left"
                    onClick={() => scrollListById('latest-list', -1)}>
                    &lt;
                </button>

                {/* Assegniamo l'ID 'latest-list' al contenitore */}
                <div id="latest-list" className="cards-list latest-arrivals-list">
                    {latestArrivals.map((quest) => (
                        <div key={quest.id} className="card-placeholder">
                            {quest.title} <br /> {quest.price}
                        </div>
                    ))}
                </div>

                {/* Pulsante Destra */}
                <button
                    className="scroll-btn scroll-right"
                    onClick={() => scrollListById('latest-list', 1)}>
                    &gt;
                </button>
            </section>


        </div>
    );
}

export default HomePage;