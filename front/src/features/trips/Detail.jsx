import { useEffect, useMemo, useState } from "react";
import { CollageTitle } from "../../components/CollageTitle.jsx";
import { ImageWithFallback } from "../../components/ImageWithFallback.jsx";
import { extractRouteHeadings, markdownToBlocks, paginateRouteBlocks } from "../../itinerary.js";
import { ChecklistBlock, ChecklistModal, ListBlock } from "./ChecklistBlocks.jsx";
import { DiarySection } from "./DiarySection.jsx";
import { RouteBlocks } from "./RouteBlocks.jsx";
import { normalizeChecklist } from "./tripModel.js";

export function Detail({
  trip,
  onBack,
  onEdit,
  onFinalize,
  onUpdateTrip,
  onOpenItinerary,
  onCreateDiaryEntry,
  onUpdateDiaryEntry,
  onDeleteDiaryEntry
}) {
  const [openChecklist, setOpenChecklist] = useState(null);
  const [editingItinerary, setEditingItinerary] = useState(false);
  const [itineraryDraft, setItineraryDraft] = useState(trip.itineraryMarkdown || "");
  const [routePage, setRoutePage] = useState(0);
  const routeBlocks = useMemo(() => markdownToBlocks(trip.itineraryMarkdown), [trip.itineraryMarkdown]);
  const routeSuggestions = useMemo(() => extractRouteHeadings(trip.itineraryMarkdown), [trip.itineraryMarkdown]);
  const routePages = useMemo(() => paginateRouteBlocks(routeBlocks), [routeBlocks]);
  const currentRoutePage = routePages[Math.min(routePage, routePages.length - 1)] || [routeBlocks, []];
  const visibleRouteColumns = currentRoutePage.filter((column) => column.length);

  useEffect(() => {
    setItineraryDraft(trip.itineraryMarkdown || "");
    setEditingItinerary(false);
    setRoutePage(0);
  }, [trip.id, trip.itineraryMarkdown]);

  useEffect(() => {
    setRoutePage((page) => Math.min(page, Math.max(routePages.length - 1, 0)));
  }, [routePages.length]);

  async function toggleChecklistItem(field, index) {
    const nextItems = normalizeChecklist(trip[field]).map((item, itemIndex) => (
      itemIndex === index ? { ...item, done: !item.done } : item
    ));

    await onUpdateTrip(trip.id, { ...trip, [field]: nextItems });
  }

  async function saveItinerary() {
    await onUpdateTrip(trip.id, { ...trip, itineraryMarkdown: itineraryDraft });
    setEditingItinerary(false);
  }

  return (
    <article className="detail-page">
      <header className="detail-hero">
        <div>
          <button className="back-button" onClick={onBack}>← Voltar</button>
          <span className={trip.status === "finalizada" ? "stamp success" : "stamp"}>{trip.status === "finalizada" ? "Viagem finalizada" : "Em planejamento"}</span>
          <CollageTitle text={trip.name} />
          <p>{trip.destination || "Destino em aberto"} · {trip.period || "Período a definir"}</p>
        </div>
        <div className="actions">
          <button className="button secondary" onClick={() => onEdit(trip)}>Editar</button>
          {trip.status !== "finalizada" ? <button className="button primary" onClick={() => onFinalize(trip.id)}>Marcar como finalizada</button> : null}
        </div>
      </header>

      <section className="moodboard">
        {trip.imageLinks?.length ? trip.imageLinks.map((image) => <ImageWithFallback key={image} src={image} fallback="foto indisponível" />) : <p>Adicione imagens para formar o painel visual da viagem.</p>}
      </section>

      <section className="info-grid">
        <ListBlock title="Documentos" items={trip.documents} />
        <ChecklistBlock
          title="Tarefas"
          items={trip.tasks}
          onToggle={(index) => toggleChecklistItem("tasks", index)}
          onOpenAll={() => setOpenChecklist("tasks")}
        />
        <ChecklistBlock
          title="Mala"
          items={trip.packingList}
          onToggle={(index) => toggleChecklistItem("packingList", index)}
          onOpenAll={() => setOpenChecklist("packingList")}
        />
        <article className="info-block">
          <h3>Seguro viagem</h3>
          <p>{trip.hasInsurance ? `Bilhete: ${trip.insuranceTicket || "não informado"}` : "Sem seguro cadastrado."}</p>
        </article>
        <article className="info-block">
          <h3>Passagens</h3>
          <p>{trip.transport || "Nenhuma informação de transporte cadastrada."}</p>
          <p>{trip.reservationCode ? `Reserva: ${trip.reservationCode}` : ""}</p>
          <p>{trip.locator ? `Localizador: ${trip.locator}` : ""}</p>
        </article>
        <article className="info-block">
          <h3>Hospedagem</h3>
          <p>{trip.accommodation || "Hospedagem não cadastrada."}</p>
          <p>{trip.accommodationDates}</p>
          <p>{trip.accommodationAddress}</p>
          {trip.accommodationLink ? <a href={trip.accommodationLink} target="_blank" rel="noreferrer">Abrir reserva</a> : null}
        </article>
      </section>

      <DiarySection
        trip={trip}
        routeSuggestions={routeSuggestions}
        onCreate={(entry) => onCreateDiaryEntry(trip.id, entry)}
        onUpdate={(entryId, entry) => onUpdateDiaryEntry(trip.id, entryId, entry)}
        onDelete={(entryId) => onDeleteDiaryEntry(trip.id, entryId)}
      />

      <section className="panel itinerary">
        <div className="itinerary-header">
          <div>
            <span className="eyebrow">Roteiro</span>
            <h2>Linha do tempo da viagem</h2>
          </div>
          <div className="actions">
            {!editingItinerary ? (
              <>
                <button className="button secondary" type="button" onClick={onOpenItinerary}>Abrir roteiro</button>
                <button className="button ghost" type="button" onClick={() => setEditingItinerary(true)}>Editar roteiro</button>
              </>
            ) : null}
          </div>
        </div>

        {editingItinerary ? (
          <div className="itinerary-editor">
            <textarea
              value={itineraryDraft}
              onChange={(event) => setItineraryDraft(event.target.value)}
              rows={12}
              placeholder="# Dia 1&#10;- Chegada&#10;- Café perto do hotel"
            />
            <div className="actions">
              <button className="button primary" type="button" onClick={saveItinerary}>Salvar roteiro</button>
              <button
                className="button ghost"
                type="button"
                onClick={() => {
                  setItineraryDraft(trip.itineraryMarkdown || "");
                  setEditingItinerary(false);
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className={visibleRouteColumns.length === 1 ? "itinerary-book single" : "itinerary-book"}>
              {visibleRouteColumns.map((column, columnIndex) => (
                <div className="itinerary-column" key={columnIndex}>
                  <RouteBlocks blocks={column} />
                </div>
              ))}
            </div>
            {routePages.length > 1 ? (
              <div className="page-controls">
                <button className="button ghost" type="button" onClick={() => setRoutePage((page) => Math.max(page - 1, 0))} disabled={routePage === 0}>
                  Página anterior
                </button>
                <span>Página {routePage + 1} de {routePages.length}</span>
                <button className="button secondary" type="button" onClick={() => setRoutePage((page) => Math.min(page + 1, routePages.length - 1))} disabled={routePage >= routePages.length - 1}>
                  Próxima página
                </button>
              </div>
            ) : null}
          </>
        )}
      </section>
      {openChecklist === "tasks" ? (
        <ChecklistModal
          title="Todas as tarefas"
          items={trip.tasks}
          onToggle={(index) => toggleChecklistItem("tasks", index)}
          onClose={() => setOpenChecklist(null)}
        />
      ) : null}
      {openChecklist === "packingList" ? (
        <ChecklistModal
          title="Lista completa da mala"
          items={trip.packingList}
          onToggle={(index) => toggleChecklistItem("packingList", index)}
          onClose={() => setOpenChecklist(null)}
        />
      ) : null}
    </article>
  );
}
