/* ========================================
   STAFF PAGE COMPONENT
   Presentazione del team e sezione carriere
   ======================================== */

import "./Staff.css";

/**
 * Componente Staff
 * Mostra i membri del team MyPocketQuest e la sezione "Lavora con Noi"
 */
export default function Staff() {
  
  /* ===== DATI DEL TEAM ===== */
  const teamMembers = [
    {
      id: 1,
      name: "Gabriele Bonucci",
      role: "Full Stack Developer",
      description: "Professionista del front-end, assicura che ogni avventura sia fluida e coinvolgente.",
      image: "/imgStaff/Gabriele.png",
      skills: ["Html", "Css", "Javascript","React","Node.js","Mysql"],
      GitHub: "https://github.com/gabrielebonucci"
    },
    {
      id: 2,
      name: "Luca Ruggeri",
      role: "Full Stack Developer",
      description: "L'ideatore dello stile visivo di MyPocketQuest, trasforma idee in design accattivanti.",
      image: "/imgStaff/Luca.png",
      skills: ["Html", "Css", "Javascript","React","Node.js","Mysql"],
        GitHub: "https://github.com/LucaRuggeri5"
    },
    {
      id: 3,
      name: "Samir Sadriu",
      role: "Full Stack Developer",
      description: "Il vero motore Backend, costruisce sistemi robusti e scalabili per supportare ogni avventura.",
      image: "/imgStaff/Samir.png",
      skills: ["Html", "Css", "Javascript","React","Node.js","Mysql"],
      GitHub: "https://github.com/SamirSadriu-24"
    },
    {
      id: 4,
      name: "Luigi Casale",
      role: "Full Stack Developer",
      description: "Creativo del marketing digitale e ideatore dello stile, amplifica la voce di MyPocketQuest nel mondo online.",
      image: "imgStaff/Luigi.png",
      skills: ["Html", "Css", "Javascript","React","Node.js","Mysql"],
      GitHub: "https://github.com/LuigiCasale95"
    },
    {
      id: 5,
      name: "Christofer Tamburini",
      role: "Full Stack Developer",
      description: "Sistema le rotte e i componenti, garantendo un'esperienza utente impeccabile.",
      image: "imgStaff/Christofer.png",
      skills: ["Html", "Css", "Javascript","React","Node.js","Mysql"],
      GitHub: "https://github.com/Tamburini-Christofer"
    }
  ];

  return (
    <div className="staff-page-container">
      
      {/* ===== HEADER ===== */}
      <div className="staff-header">
        <h1 className="staff-main-title">Il Nostro Team</h1>
        <p className="staff-subtitle">
          Le persone straordinarie che rendono possibile MyPocketQuest
        </p>
      </div>

      {/* ===== GRIGLIA MEMBRI DEL TEAM ===== */}
      <div className="team-grid">
        {teamMembers.map((member) => (
          <a 
            key={member.id} 
            href={member.GitHub} 
            target="_blank" 
            rel="noopener noreferrer"
            className="team-card"
          >
            <div className="team-card-image-wrapper">
              <img 
                src={member.image} 
                alt={member.name} 
                className="team-card-image" 
              />
              <div className="team-card-overlay"></div>
            </div>
            
            <div className="team-card-content">
              <h3 className="team-member-name">{member.name}</h3>
              <p className="team-member-role">{member.role}</p>
              <p className="team-member-description">{member.description}</p>
              
              <div className="team-member-skills">
                {member.skills.map((skill, index) => (
                  <span key={index} className="skill-badge">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* ===== SEZIONE LAVORA CON NOI ===== */}
      <div className="careers-section">
        <div className="careers-content">
          
          {/* Colonna sinistra: Informazioni */}
          <div className="careers-info">
            <h2 className="careers-title">Lavora con Noi</h2>
            <p className="careers-description">
              Non siamo solo un'azienda, siamo una community di appassionati che 
              condividono la stessa visione: rendere il gaming accessibile, divertente 
              e coinvolgente per tutti.
            </p>

            <div className="careers-benefits">
              <ul className="benefits-list">
                <li className="benefit-item">
                  <div>
                    <strong>Crescita Continua</strong>
                    <p>Formazione costante e opportunità di avanzamento professionale</p>
                  </div>
                </li>
                <li className="benefit-item">
                  <div>
                    <strong>Innovazione</strong>
                    <p>Stack tecnologico moderno e libertà di sperimentare</p>
                  </div>
                </li>
                <li className="benefit-item">
                  <div>
                    <strong>Team Affiatato</strong>
                    <p>Collaborazione, rispetto e supporto reciproco</p>
                  </div>
                </li>
                <li className="benefit-item">
                  <div>
                    <strong>Impatto Reale</strong>
                    <p>Le tue idee contano e possono cambiare il prodotto</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Colonna destra: Form */}
          <div className="careers-form-wrapper">
            <div className="careers-card">
              <h3 className="careers-card-title">Candidati Ora</h3>
              <form className="careers-form">
                <div className="form-row">
                  <div className="input-group">
                    <label className="input-label" htmlFor="fullName">
                      Nome Completo *
                    </label>
                    <input
                      id="fullName"
                      className="careers-input"
                      type="text"
                      placeholder="Mario Rossi"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label" htmlFor="email">
                      Email *
                    </label>
                    <input
                      id="email"
                      className="careers-input"
                      type="email"
                      placeholder="mario.rossi@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label className="input-label" htmlFor="phone">
                      Telefono
                    </label>
                    <input
                      id="phone"
                      className="careers-input"
                      type="tel"
                      placeholder="+39 123 456 7890"
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label" htmlFor="position">
                      Posizione di Interesse *
                    </label>
                    <select
                      id="position"
                      className="careers-input"
                      required
                    >
                      <option value="">Seleziona una posizione</option>
                      <option value="fullstack">Full Stack Developer</option>
                      <option value="frontend">Frontend Developer</option>
                      <option value="backend">Backend Developer</option>
                      <option value="designer">UI/UX Designer</option>
                      <option value="marketing">Marketing Specialist</option>
                      <option value="community">Community Manager</option>
                      <option value="other">Altro</option>
                    </select>
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="linkedin">
                    LinkedIn / Portfolio
                  </label>
                  <input
                    id="linkedin"
                    className="careers-input"
                    type="url"
                    placeholder="https://linkedin.com/in/tuoprofilo"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="experience">
                    Anni di Esperienza
                  </label>
                  <select
                    id="experience"
                    className="careers-input"
                  >
                    <option value="">Seleziona...</option>
                    <option value="0-1">0-1 anni</option>
                    <option value="1-3">1-3 anni</option>
                    <option value="3-5">3-5 anni</option>
                    <option value="5+">5+ anni</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="message">
                    Presentati e raccontaci perché vorresti unirti a noi *
                  </label>
                  <textarea
                    id="message"
                    className="careers-textarea"
                    placeholder="Scrivi qui la tua lettera di presentazione..."
                    required
                    rows="6"
                  />
                </div>

                <button className="careers-submit-btn" type="submit">
                  <span>Invia Candidatura</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
