import { useEffect, useMemo, useState } from "react";
import { tripsApi } from "./api.js";
import homeCollage1 from "./assets/home-collage-1.jpg";
import homeCollage2 from "./assets/home-collage-2.jpg";
import homeCollage3 from "./assets/home-collage-3.jpg";
import homeCollage4 from "./assets/home-collage-4.jpg";
import homeCollage5 from "./assets/home-collage-5.jpg";

const homeCollageImages = [homeCollage3, homeCollage2, homeCollage1, homeCollage4, homeCollage5];

const emptyTrip = {
  name: "",
  destination: "",
  period: "",
  status: "proxima",
  imageLinks: [],
  documents: [],
  tasks: [],
  packingList: [
    { text: "Passaporte ou documento", done: false },
    { text: "Carregador", done: false },
    { text: "Seguro viagem", done: false },
    { text: "Remédios pessoais", done: false },
    { text: "Roupas confortáveis", done: false }
  ],
  hasInsurance: false,
  insuranceTicket: "",
  transport: "",
  reservationCode: "",
  locator: "",
  accommodation: "",
  accommodationDates: "",
  accommodationLink: "",
  accommodationAddress: "",
  accommodationDirections: "",
  internalTransport: "",
  itineraryMarkdown: ""
};

function listToText(value) {
  return Array.isArray(value) ? value.map((item) => (typeof item === "string" ? item : item.text)).join("\n") : "";
}

function textToList(value) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function textToChecklist(value) {
  return textToList(value).map((text) => ({ text, done: false }));
}

function normalizeChecklist(items) {
  return (items || []).map((item) => (typeof item === "string" ? { text: item, done: false } : item));
}

function toFormState(trip = emptyTrip) {
  return {
    ...emptyTrip,
    ...trip,
    imageLinksText: listToText(trip.imageLinks || emptyTrip.imageLinks),
    documentsText: listToText(trip.documents || emptyTrip.documents),
    tasksText: listToText(trip.tasks || emptyTrip.tasks),
    packingListText: listToText(trip.packingList || emptyTrip.packingList)
  };
}

function toPayload(form) {
  return {
    ...form,
    imageLinks: textToList(form.imageLinksText),
    documents: textToList(form.documentsText),
    tasks: textToChecklist(form.tasksText),
    packingList: textToChecklist(form.packingListText)
  };
}

function inlineMarkdown(text) {
  const parts = [];
  const pattern = /(\*\*([^*]+)\*\*)|(\[([^\]]+)\]\(([^)]+)\))/g;
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      parts.push(<strong key={`${match.index}-strong`}>{match[2]}</strong>);
    } else if (match[4] && match[5]) {
      parts.push(
        <a key={`${match.index}-link`} href={match[5]} target="_blank" rel="noreferrer">
          {match[4]}
        </a>
      );
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length ? parts : text;
}

function parseMarkdownTable(lines, startIndex) {
  const tableLines = [];
  let index = startIndex;

  while (index < lines.length && lines[index].trim().startsWith("|")) {
    tableLines.push(lines[index].trim());
    index += 1;
  }

  if (tableLines.length < 2) {
    return null;
  }

  const headers = tableLines[0].split("|").slice(1, -1).map((cell) => cell.trim());
  const rows = tableLines
    .slice(2)
    .map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim()))
    .filter((row) => row.length);

  return {
    block: { type: "table", headers, rows, id: startIndex },
    nextIndex: index
  };
}

function markdownToBlocks(markdown) {
  if (!markdown.trim()) {
    return [{ type: "p", text: "Nenhum roteiro cadastrado ainda." }];
  }

  const lines = markdown.split("\n");
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();

    if (!line) {
      index += 1;
      continue;
    }

    if (/^-{3,}$/.test(line)) {
      blocks.push({ type: "divider", id: index });
      index += 1;
      continue;
    }

    if (line.startsWith("|")) {
      const table = parseMarkdownTable(lines, index);
      if (table) {
        blocks.push(table.block);
        index = table.nextIndex;
        continue;
      }
    }

    if (line.startsWith("# ")) {
      blocks.push({ type: "h1", text: line.slice(2), id: index });
      index += 1;
      continue;
    }

    if (line.startsWith("## ")) {
      blocks.push({ type: "h2", text: line.slice(3), id: index });
      index += 1;
      continue;
    }

    if (line.startsWith("### ")) {
      blocks.push({ type: "h3", text: line.slice(4), id: index });
      index += 1;
      continue;
    }

    if (/^- \[[ xX]\] /.test(line)) {
      blocks.push({
        type: "task",
        checked: /^- \[[xX]\] /.test(line),
        text: line.replace(/^- \[[ xX]\] /, ""),
        id: index
      });
      index += 1;
      continue;
    }

    if (line.startsWith("- ")) {
      const items = [];
      while (index < lines.length && lines[index].trim().startsWith("- ") && !/^- \[[ xX]\] /.test(lines[index].trim())) {
        items.push(lines[index].trim().slice(2));
        index += 1;
      }
      blocks.push({ type: "list", items, id: index });
      continue;
    }

    blocks.push({ type: "p", text: line, id: index });
    index += 1;
  }

  return blocks;
}

function CollageTitle({ text }) {
  const characters = String(text || "")
    .slice(0, 18)
    .split("");

  return (
    <h1 className="collage-title" aria-label={text}>
      {characters.map((character, index) => (
        <span className={character === " " ? "letter space" : "letter"} aria-hidden="true" key={`${character}-${index}`}>
          {character === " " ? "\u00a0" : character}
        </span>
      ))}
    </h1>
  );
}

function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function ImageWithFallback({ src, alt = "", className = "", fallback = "sem foto" }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <div className={className ? `${className} image-placeholder` : "image-placeholder"}>{fallback}</div>;
  }

  return <img className={className} src={src} alt={alt} onError={() => setFailed(true)} />;
}

function TextInput({ label, value, onChange, placeholder }) {
  return (
    <Field label={label}>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </Field>
  );
}

function TextArea({ label, value, onChange, placeholder, rows = 4 }) {
  return (
    <Field label={label}>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={rows} />
    </Field>
  );
}

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

function Home({ trips, loading, activeTab, setActiveTab, onNew, onOpen, onEdit, onFinalize }) {
  const filteredTrips = trips.filter((trip) => (activeTab === "proximas" ? trip.status !== "finalizada" : trip.status === "finalizada"));
  const nextTrips = trips.filter((trip) => trip.status !== "finalizada").length;
  const finishedTrips = trips.filter((trip) => trip.status === "finalizada").length;

  return (
    <>
      <header className="notebook-cover">
        <div className="cover-copy">
          <span className="eyebrow">ModoViagem</span>
          <h1>Diário pessoal de viagens.</h1>
          <p>Guarde planos, fotos, reservas e lembranças em um diário que já começa antes do embarque.</p>
          <div className="cover-actions">
            <button className="button primary" onClick={onNew}>Nova viagem</button>
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
        <button className="button primary" onClick={onNew}>Nova viagem</button>
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

function TripForm({ selectedTrip, onCancel, onSaved }) {
  const [form, setForm] = useState(() => toFormState(selectedTrip || emptyTrip));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = toPayload(form);
      const saved = selectedTrip?.id ? await tripsApi.update(selectedTrip.id, payload) : await tripsApi.create(payload);
      onSaved(saved);
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="panel form-page" onSubmit={handleSubmit}>
      <div className="section-heading">
        <span className="eyebrow">{selectedTrip ? "Editar viagem" : "Nova viagem"}</span>
        <h2>{selectedTrip ? form.name : "Começar um passaporte"}</h2>
        <p>Preencha o essencial agora. O diário pode crescer aos poucos conforme a viagem ganha forma.</p>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="form-grid">
        <TextInput label="Nome da viagem" value={form.name} onChange={(value) => update("name", value)} placeholder="Ex.: Rio de Janeiro em abril" />
        <TextInput label="Destino" value={form.destination} onChange={(value) => update("destination", value)} placeholder="Cidade, país ou rota" />
        <TextInput label="Período" value={form.period} onChange={(value) => update("period", value)} placeholder="02/04/2026 a 05/04/2026" />
        <Field label="Status">
          <select value={form.status} onChange={(event) => update("status", event.target.value)}>
            <option value="proxima">Próxima</option>
            <option value="finalizada">Finalizada</option>
          </select>
        </Field>
      </div>

      <div className="form-grid two">
        <TextArea label="Imagens por link" value={form.imageLinksText} onChange={(value) => update("imageLinksText", value)} placeholder="Cole um link de imagem por linha" />
        <TextArea label="Documentos necessários" value={form.documentsText} onChange={(value) => update("documentsText", value)} placeholder="Passaporte&#10;Visto&#10;Comprovante de hospedagem" />
        <TextArea label="Tarefas" value={form.tasksText} onChange={(value) => update("tasksText", value)} placeholder="Comprar passagem&#10;Reservar hotel" />
        <TextArea label="Lista de mala" value={form.packingListText} onChange={(value) => update("packingListText", value)} />
      </div>

      <section className="form-section">
        <h3>Seguro, passagens e hospedagem</h3>
        <label className="check-field">
          <input type="checkbox" checked={form.hasInsurance} onChange={(event) => update("hasInsurance", event.target.checked)} />
          Possui seguro viagem
        </label>
        <div className="form-grid">
          <TextInput label="Bilhete do seguro" value={form.insuranceTicket} onChange={(value) => update("insuranceTicket", value)} />
          <TextInput label="Passagens ou transporte" value={form.transport} onChange={(value) => update("transport", value)} />
          <TextInput label="Número da reserva" value={form.reservationCode} onChange={(value) => update("reservationCode", value)} />
          <TextInput label="Localizador" value={form.locator} onChange={(value) => update("locator", value)} />
          <TextInput label="Hospedagem" value={form.accommodation} onChange={(value) => update("accommodation", value)} />
          <TextInput label="Check-in e check-out" value={form.accommodationDates} onChange={(value) => update("accommodationDates", value)} />
          <TextInput label="Link da reserva" value={form.accommodationLink} onChange={(value) => update("accommodationLink", value)} />
          <TextInput label="Endereço" value={form.accommodationAddress} onChange={(value) => update("accommodationAddress", value)} />
        </div>
        <TextArea label="Como chegar até a hospedagem" value={form.accommodationDirections} onChange={(value) => update("accommodationDirections", value)} />
        <TextArea label="Deslocamentos internos" value={form.internalTransport} onChange={(value) => update("internalTransport", value)} />
      </section>

      <TextArea label="Roteiro em Markdown" value={form.itineraryMarkdown} onChange={(value) => update("itineraryMarkdown", value)} placeholder="# Dia 1&#10;- Chegada&#10;- Café perto do hotel" rows={8} />

      <div className="actions">
        <button className="button primary" type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar viagem"}</button>
        <button className="button ghost" type="button" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
}

function ListBlock({ title, items }) {
  return (
    <article className="info-block">
      <h3>{title}</h3>
      {items?.length ? (
        <ul>
          {items.map((item) => <li key={item}>{item}</li>)}
        </ul>
      ) : (
        <p>Nada cadastrado ainda.</p>
      )}
    </article>
  );
}

function ChecklistBlock({ title, items, onToggle, onOpenAll, limit = 5 }) {
  const normalizedItems = normalizeChecklist(items);
  const visibleItems = normalizedItems.slice(0, limit);
  const hiddenCount = Math.max(normalizedItems.length - visibleItems.length, 0);

  return (
    <article className="info-block">
      <h3>{title}</h3>
      {visibleItems.length ? (
        <div className="checklist-items">
          {visibleItems.map((item, index) => (
            <label className={item.done ? "check-item done" : "check-item"} key={`${item.text}-${index}`}>
              <input type="checkbox" checked={item.done} onChange={() => onToggle(index)} />
              <span>{item.text}</span>
            </label>
          ))}
        </div>
      ) : (
        <p>Nada cadastrado ainda.</p>
      )}
      {hiddenCount > 0 ? (
        <button className="more-button" type="button" onClick={onOpenAll}>
          ... ver mais {hiddenCount}
        </button>
      ) : null}
    </article>
  );
}

function ChecklistModal({ title, items, onToggle, onClose }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={title}>
      <article className="modal-card">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="back-button" type="button" onClick={onClose}>Fechar</button>
        </div>
        <div className="checklist-items modal-list">
          {normalizeChecklist(items).map((item, index) => (
            <label className={item.done ? "check-item done" : "check-item"} key={`${item.text}-${index}`}>
              <input type="checkbox" checked={item.done} onChange={() => onToggle(index)} />
              <span>{item.text}</span>
            </label>
          ))}
        </div>
      </article>
    </div>
  );
}

function Detail({ trip, onBack, onEdit, onFinalize, onUpdateTrip }) {
  const [openChecklist, setOpenChecklist] = useState(null);
  const [editingItinerary, setEditingItinerary] = useState(false);
  const [itineraryDraft, setItineraryDraft] = useState(trip.itineraryMarkdown || "");

  useEffect(() => {
    setItineraryDraft(trip.itineraryMarkdown || "");
    setEditingItinerary(false);
  }, [trip.id, trip.itineraryMarkdown]);

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

      <section className="panel itinerary">
        <div className="itinerary-header">
          <div>
            <span className="eyebrow">Roteiro</span>
            <h2>Linha do tempo da viagem</h2>
          </div>
          {!editingItinerary ? (
            <button className="button secondary" type="button" onClick={() => setEditingItinerary(true)}>Editar roteiro</button>
          ) : null}
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
          <div className="itinerary-preview">
            {markdownToBlocks(trip.itineraryMarkdown).map((block) => {
              if (block.type === "h1") return <h3 className="route-title" key={block.id}>{inlineMarkdown(block.text)}</h3>;
              if (block.type === "h2") return <h4 className="route-subtitle" key={block.id}>{inlineMarkdown(block.text)}</h4>;
              if (block.type === "h3") return <h5 className="route-small-title" key={block.id}>{inlineMarkdown(block.text)}</h5>;
              if (block.type === "divider") return <hr className="route-divider" key={block.id} />;
              if (block.type === "list") {
                return (
                  <ul className="route-list" key={block.id}>
                    {block.items.map((item, itemIndex) => <li key={`${item}-${itemIndex}`}>{inlineMarkdown(item)}</li>)}
                  </ul>
                );
              }
              if (block.type === "task") {
                return (
                  <label className="route-task" key={block.id}>
                    <input type="checkbox" checked={block.checked} readOnly />
                    <span>{inlineMarkdown(block.text || "Item pendente")}</span>
                  </label>
                );
              }
              if (block.type === "table") {
                return (
                  <div className="route-table-wrap" key={block.id}>
                    <table className="route-table">
                      <thead>
                        <tr>
                          {block.headers.map((header) => <th key={header}>{inlineMarkdown(header)}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {block.rows.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {row.map((cell, cellIndex) => <td key={`${cell}-${cellIndex}`}>{inlineMarkdown(cell)}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              }
              return block.text ? <p className="route-paragraph" key={block.id}>{inlineMarkdown(block.text)}</p> : null;
            })}
          </div>
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

export function App() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("home");
  const [activeTab, setActiveTab] = useState("proximas");
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [error, setError] = useState("");

  const selectedTripFromList = useMemo(() => {
    if (!selectedTrip?.id) return selectedTrip;
    return trips.find((trip) => trip.id === selectedTrip.id) || selectedTrip;
  }, [selectedTrip, trips]);

  async function loadTrips() {
    setLoading(true);
    setError("");

    try {
      setTrips(await tripsApi.list());
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTrips();
  }, []);

  async function finalizeTrip(id) {
    await tripsApi.finalize(id);
    await loadTrips();
  }

  async function updateTrip(id, payload) {
    const saved = await tripsApi.update(id, payload);
    setTrips((currentTrips) => currentTrips.map((trip) => (trip.id === id ? saved : trip)));
    setSelectedTrip(saved);
    return saved;
  }

  function openTrip(trip) {
    setSelectedTrip(trip);
    setView("detail");
  }

  function editTrip(trip) {
    setSelectedTrip(trip);
    setView("form");
  }

  async function handleSaved(trip) {
    await loadTrips();
    setSelectedTrip(trip);
    setView("detail");
  }

  return (
    <main className="page">
      {error ? <p className="global-error">{error}</p> : null}
      {view === "home" ? (
        <Home
          trips={trips}
          loading={loading}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onNew={() => {
            setSelectedTrip(null);
            setView("form");
          }}
          onOpen={openTrip}
          onEdit={editTrip}
          onFinalize={finalizeTrip}
        />
      ) : null}
      {view === "form" ? (
        <TripForm
          selectedTrip={selectedTripFromList}
          onCancel={() => setView(selectedTrip ? "detail" : "home")}
          onSaved={handleSaved}
        />
      ) : null}
      {view === "detail" && selectedTripFromList ? (
        <Detail
          trip={selectedTripFromList}
          onBack={() => setView("home")}
          onEdit={editTrip}
          onFinalize={finalizeTrip}
          onUpdateTrip={updateTrip}
        />
      ) : null}
    </main>
  );
}
