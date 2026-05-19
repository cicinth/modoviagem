import { useMemo } from "react";
import { markdownToBlocks } from "../../itinerary.js";
import { RouteBlocks } from "./RouteBlocks.jsx";

export function ItineraryPage({ trip, onBack }) {
  const routeBlocks = useMemo(() => markdownToBlocks(trip.itineraryMarkdown), [trip.itineraryMarkdown]);

  return (
    <article className="itinerary-full-page">
      <header className="itinerary-full-header">
        <div>
          <button className="back-button" type="button" onClick={onBack}>← Voltar para viagem</button>
          <span className="eyebrow">Roteiro completo</span>
          <h1>{trip.name}</h1>
          <p>{trip.destination || "Destino em aberto"} · {trip.period || "Período a definir"}</p>
        </div>
      </header>
      <section className="panel itinerary itinerary-full-content">
        <div className="itinerary-preview">
          <RouteBlocks blocks={routeBlocks} />
        </div>
      </section>
    </article>
  );
}
