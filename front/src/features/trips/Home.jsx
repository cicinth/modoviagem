import { ImageWithFallback } from "../../components/ImageWithFallback.jsx";
import homeCollage1 from "../../assets/home-collage-1.jpg";
import homeCollage2 from "../../assets/home-collage-2.jpg";
import homeCollage3 from "../../assets/home-collage-3.jpg";
import homeCollage4 from "../../assets/home-collage-4.jpg";
import homeCollage5 from "../../assets/home-collage-5.jpg";

const homeCollageImages = [homeCollage3, homeCollage2, homeCollage1, homeCollage4, homeCollage5];

function TripCard({ trip, onOpen, onEdit, onFinalize }) {
  const firstImage = trip.imageLinks?.[0];

  return (
    <article className="trip-card">
      <ImageWithFallback src={firstImage} fallback="sem foto" />
      <div className="trip-card-body">
        <span className={trip.status === "finalizada" ? "stamp success" : "stamp"}>{trip.status === "finalizada" ? "Finalizada" : "Em planejamento"}</span>
        <h3>{trip.name}</h3>
        <p>{trip.destination || "Destino em aberto"}</p>
        <p>{trip.period || "Período a definir"}</p>
        <div className="actions">
          <button className="button secondary" onClick={() => onOpen(trip)}>Abrir passaporte</button>
          <button className="button ghost" onClick={() => onEdit(trip)}>Editar</button>
          {trip.status !== "finalizada" ? (
            <button className="button ghost" onClick={() => onFinalize(trip.id)}>Finalizar</button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function Home({ trips, loading, activeTab, setActiveTab, user, onLogout, onNew, onOpen, onEdit, onFinalize }) {
  const filteredTrips = trips.filter((trip) => (activeTab === "proximas" ? trip.status !== "finalizada" : trip.status === "finalizada"));
  const nextTrips = trips.filter((trip) => trip.status !== "finalizada").length;
  const finishedTrips = trips.filter((trip) => trip.status === "finalizada").length;

  return (
    <>
      <header className="notebook-cover">
        <div className="cover-copy">
          <span className="eyebrow">Viajário</span>
          <h1>Diário pessoal de viagens.</h1>
          {user ? <p>Olá, {user.name}. Aqui ficam suas viagens, fotos e memórias.</p> : null}
          <p>Guarde planos, fotos, reservas e lembranças em um diário que já começa antes do embarque.</p>
          <div className="cover-actions">
            <button className="button primary" onClick={onNew}>Nova viagem</button>
            <button className="button ghost" onClick={onLogout}>Sair</button>
          </div>
        </div>
        <div className="cover-board" aria-label="Capa visual do diário de viagem">
          <div className="cover-collage" aria-hidden="true">
            {homeCollageImages.map((image, index) => (
              <img className={`cover-collage-photo photo-${index + 1}`} src={image} alt="" key={image} />
            ))}
          </div>
          <div className="cover-star-sticker" aria-hidden="true" />
          <div className="cover-note note-b">
            <strong>{nextTrips}</strong>
            <span>próximas</span>
          </div>
          <div className="cover-note note-c">
            <strong>{finishedTrips}</strong>
            <span>finalizadas</span>
          </div>
        </div>
      </header>

      <section className="toolbar panel">
        <div className="tabs" aria-label="Filtro de viagens">
          <button className={activeTab === "proximas" ? "active" : ""} onClick={() => setActiveTab("proximas")}>Próximas</button>
          <button className={activeTab === "finalizadas" ? "active" : ""} onClick={() => setActiveTab("finalizadas")}>Finalizadas</button>
        </div>
        <div className="actions">
          <button className="button ghost" onClick={onLogout}>Sair</button>
          <button className="button primary" onClick={onNew}>Nova viagem</button>
        </div>
      </section>

      <section className="trip-grid">
        {loading ? <p>Carregando viagens...</p> : null}
        {!loading && filteredTrips.length === 0 ? (
          <article className="empty-state">
            <span className="script">primeira página</span>
            <h2>Nenhuma viagem por aqui ainda.</h2>
            <p>Crie uma viagem para começar a montar seu diário, salvar links e transformar pendências em um plano claro.</p>
            <button className="button primary" onClick={onNew}>Criar viagem</button>
          </article>
        ) : null}
        {filteredTrips.map((trip) => (
          <TripCard key={trip.id} trip={trip} onOpen={onOpen} onEdit={onEdit} onFinalize={onFinalize} />
        ))}
      </section>
    </>
  );
}
