import { useEffect, useMemo, useState } from "react";
import { defaultPackingList, emptyTrip, sampleTrips } from "./data/templates";
import { itineraryHelp, parseItineraryMarkdown } from "./utils/itineraryParser";

function listFromText(value) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function App() {
  const [view, setView] = useState("home");
  const [tab, setTab] = useState("upcoming");
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [form, setForm] = useState(emptyTrip);
  const [editingId, setEditingId] = useState(null);
  const [showFormat, setShowFormat] = useState(false);

  const filteredTrips = trips.filter((trip) => trip.status === tab);
  const previewImages = listFromText(form.images);
  const parsedRoute = useMemo(() => parseItineraryMarkdown(form.itineraryMarkdown), [form.itineraryMarkdown]);

  useEffect(() => {
    fetch("/api/trips")
      .then((response) => response.json())
      .then((items) => {
        setTrips(items);
        setSelectedTrip(items[0] || null);
      });
  }, []);

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function createTrip(event) {
    event.preventDefault();
    const trip = {
      ...form,
      images: previewImages,
      documents: listFromText(form.documents),
      tasks: listFromText(form.tasks),
      mobilityTickets: listFromText(form.mobilityTickets),
      packingList: form.useDefaultPacking ? defaultPackingList : [{ section: "Minha lista", items: listFromText(form.packingList) }],
      itinerary: parsedRoute,
      sourceKind: form.sourceUrl.includes("notion.so") ? "Notion" : "Google/externo"
    };

    const response = await fetch(editingId ? `/api/trips/${editingId}` : "/api/trips", {
      method: editingId ? "PUT" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(trip)
    });
    const savedTrip = await response.json();

    setTrips((current) => editingId ? current.map((item) => item.id === editingId ? savedTrip : item) : [savedTrip, ...current]);
    setSelectedTrip(savedTrip);
    setForm(emptyTrip);
    setEditingId(null);
    setTab(trip.status);
    setView("details");
  }

  function editTrip(trip) {
    setEditingId(trip.id);
    setForm({
      ...emptyTrip,
      ...trip,
      images: Array.isArray(trip.images) ? trip.images.join("\n") : trip.images || "",
      documents: Array.isArray(trip.documents) ? trip.documents.join("\n") : trip.documents || "",
      tasks: Array.isArray(trip.tasks) ? trip.tasks.join("\n") : trip.tasks || "",
      mobilityTickets: Array.isArray(trip.mobilityTickets) ? trip.mobilityTickets.join("\n") : trip.mobilityTickets || "",
      packingList: Array.isArray(trip.packingList) ? trip.packingList.flatMap((group) => group.items || []).join("\n") : "",
      useDefaultPacking: Array.isArray(trip.packingList) ? false : true,
      itineraryMarkdown: trip.itineraryMarkdown || ""
    });
    setView("new");
  }

  async function finishTrip(trip) {
    const response = await fetch(`/api/trips/${trip.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: "finished" })
    });
    const savedTrip = await response.json();
    setTrips((current) => current.map((item) => item.id === savedTrip.id ? savedTrip : item));
    setSelectedTrip(savedTrip);
    setTab("finished");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" type="button" onClick={() => setView("home")}>
          <span className="brand-mark">V</span>
          <span>
            <strong>Viagens</strong>
            <small>fontes externas + moodboard</small>
          </span>
        </button>

        <nav className="nav" aria-label="Navegacao">
          {[
            ["home", "Home"],
            ["new", "Nova viagem"],
            ["details", "Pagina da viagem"],
            ["route", "Roteiro"]
          ].map(([id, label]) => (
            <button key={id} className={`nav-item ${view === id ? "active" : ""}`} type="button" onClick={() => setView(id)}>
              {label}
            </button>
          ))}
        </nav>

        <section className="sticker-note">
          <span className="script">sem banco local</span>
          <strong>Use links do Notion ou Google</strong>
          <p>O projeto e so o front. O conteudo oficial deve morar nos documentos externos que voce informar.</p>
        </section>
      </aside>

      <main className="main">
        {view === "home" && (
          <>
            <header className="hero">
              <div>
                <span className="eyebrow">Planejador de viagens</span>
                <h1>Seu caderno de viagens</h1>
                <p>
                  Home para acompanhar proximas viagens, finalizadas e abrir uma pagina completa de cada plano:
                  documentos, mala, tarefas, seguro, voos, acomodacao, locomocao e roteiro em Markdown.
                </p>
                <button className="primary-button" type="button" onClick={() => setView("new")}>
                  Adicionar nova viagem
                </button>
              </div>
              <Moodboard images={sampleTrips.flatMap((trip) => trip.images).slice(0, 3)} variant="hero" />
            </header>

            <section className="stats-grid">
              <Stat label="Proximas" value={trips.filter((trip) => trip.status === "upcoming").length} />
              <Stat label="Finalizadas" value={trips.filter((trip) => trip.status === "finished").length} />
              <Stat label="Fontes externas" value={trips.filter((trip) => trip.sourceUrl).length} />
            </section>

            <div className="tabbar">
              <button className={`tab-button ${tab === "upcoming" ? "active" : ""}`} type="button" onClick={() => setTab("upcoming")}>
                Proximas viagens
              </button>
              <button className={`tab-button ${tab === "finished" ? "active" : ""}`} type="button" onClick={() => setTab("finished")}>
                Finalizadas
              </button>
            </div>

            <section className="trip-grid">
              {filteredTrips.map((trip, index) => (
                <TripCard
                  key={trip.id}
                  index={index}
                  trip={trip}
                  onOpen={() => {
                    setSelectedTrip(trip);
                    setView("details");
                  }}
                />
              ))}
            </section>
          </>
        )}

        {view === "new" && (
          <section>
            <div className="section-head">
              <div>
                <span className="eyebrow">Nova viagem</span>
                <h2>Dados vindos de fonte externa</h2>
              </div>
            </div>

            <form className="trip-form" onSubmit={createTrip}>
              {editingId && <div className="edit-banner">Editando viagem existente. Ao salvar, o arquivo interno sera atualizado.</div>}
              <Panel title="Base externa">
                <div className="form-grid">
                  <Field label="Nome da viagem" value={form.name} onChange={(value) => updateForm("name", value)} required />
                  <label>
                    Status
                    <select value={form.status} onChange={(event) => updateForm("status", event.target.value)}>
                      <option value="upcoming">Nao finalizada</option>
                      <option value="finished">Finalizada</option>
                    </select>
                  </label>
                  <Field label="Link do Notion ou Google" value={form.sourceUrl} onChange={(value) => updateForm("sourceUrl", value)} required />
                  <Field label="Data da viagem" value={form.dates} onChange={(value) => updateForm("dates", value)} />
                </div>
                <TextField label="Links de imagens, um por linha" value={form.images} onChange={(value) => updateForm("images", value)} />
              </Panel>

              <Panel title="Documentos, tarefas e mala">
                <TextField label="Documentos necessarios" value={form.documents} onChange={(value) => updateForm("documents", value)} />
                <TextField label="Tarefas a fazer" value={form.tasks} onChange={(value) => updateForm("tasks", value)} placeholder="Tirar passaporte, agendar hotel, comprar passagem..." />
                <label className="check-row">
                  <input type="checkbox" checked={form.useDefaultPacking} onChange={(event) => updateForm("useDefaultPacking", event.target.checked)} />
                  Comecar com minha lista padrao de mala
                </label>
                <Field label="Link externo da lista de mala" value={form.packingSourceUrl} onChange={(value) => updateForm("packingSourceUrl", value)} />
                {!form.useDefaultPacking && (
                  <TextField label="Criar lista de mala do zero" value={form.packingList} onChange={(value) => updateForm("packingList", value)} />
                )}
              </Panel>

              <Panel title="Seguro, passagens e acomodacao">
                <label>
                  Seguro viagem?
                  <select value={form.insuranceRequired} onChange={(event) => updateForm("insuranceRequired", event.target.value)}>
                    <option value="no">Nao</option>
                    <option value="yes">Sim</option>
                  </select>
                </label>
                {form.insuranceRequired === "yes" && <Field label="Numero do bilhete do seguro" value={form.insuranceTicket} onChange={(value) => updateForm("insuranceTicket", value)} />}
                <TextField label="Passagens aereas - itinerario" value={form.flightItinerary} onChange={(value) => updateForm("flightItinerary", value)} />
                <div className="form-grid">
                  <Field label="Numero da reserva" value={form.flightReservation} onChange={(value) => updateForm("flightReservation", value)} />
                  <Field label="Localizador" value={form.flightLocator} onChange={(value) => updateForm("flightLocator", value)} />
                  <Field label="Check-in acomodacao" value={form.accommodationCheckin} onChange={(value) => updateForm("accommodationCheckin", value)} />
                  <Field label="Check-out acomodacao" value={form.accommodationCheckout} onChange={(value) => updateForm("accommodationCheckout", value)} />
                  <Field label="Link da reserva" value={form.accommodationLink} onChange={(value) => updateForm("accommodationLink", value)} />
                  <Field label="Endereco" value={form.accommodationAddress} onChange={(value) => updateForm("accommodationAddress", value)} />
                </div>
                <TextField label="Como vamos chegar na acomodacao" value={form.accommodationArrival} onChange={(value) => updateForm("accommodationArrival", value)} />
                <TextField label="Passagens aereas/trens para locomocao dentro da viagem" value={form.mobilityTickets} onChange={(value) => updateForm("mobilityTickets", value)} />
              </Panel>

              <Panel title="Roteiro Markdown">
                <div className="info-line">
                  <button className="info-button" type="button" onClick={() => setShowFormat((value) => !value)} aria-label="Ver formato do Markdown">
                    i
                  </button>
                  <span>O roteiro deve vir de um documento externo e seguir tags como #dias_totais, #cidade, #dia, #titulo e #passeios.</span>
                </div>
                {showFormat && <pre className="format-box">{itineraryHelp}</pre>}
                <Field label="Link do documento do roteiro" value={form.itinerarySourceUrl} onChange={(value) => updateForm("itinerarySourceUrl", value)} />
                <TextField label="Cole aqui o Markdown copiado do documento" value={form.itineraryMarkdown} onChange={(value) => updateForm("itineraryMarkdown", value)} />
              </Panel>

              <button className="primary-button" type="submit">{editingId ? "Salvar alteracoes" : "Criar pagina da viagem"}</button>
            </form>

            <section className="image-lab">
              <span className="eyebrow">Preview</span>
              <h2>Moodboard da viagem</h2>
              <Moodboard images={previewImages.length ? previewImages : sampleTrips[0].images} variant="gallery" />
            </section>
          </section>
        )}

        {view === "details" && <TripDetails trip={selectedTrip} onRoute={() => setView("route")} onEdit={editTrip} onFinish={finishTrip} />}
        {view === "route" && <RouteNotebook trip={selectedTrip} />}
      </main>
    </div>
  );
}

function Field({ label, value, onChange, required = false }) {
  return (
    <label>
      {label}
      <input required={required} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TextField({ label, value, onChange, placeholder }) {
  return (
    <label>
      {label}
      <textarea placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Panel({ title, children }) {
  return (
    <section className="panel">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <article className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function Moodboard({ images, variant = "gallery" }) {
  return (
    <div className={`moodboard moodboard-${variant}`}>
      {images.slice(0, 4).map((image, index) => (
        <figure className={`scrap tilt-${(index % 3) + 1}`} key={`${image}-${index}`}>
          <img src={image} alt="" />
          <figcaption>foto {index + 1}</figcaption>
        </figure>
      ))}
    </div>
  );
}

function TripCard({ trip, index, onOpen }) {
  return (
    <article className={`trip-card tilt-${(index % 3) + 1}`}>
      <img src={trip.images?.[0]} alt="" />
      <div>
        <span>{trip.status === "upcoming" ? "nao finalizada" : "finalizada"}</span>
        <strong>{trip.name}</strong>
        <p>{trip.dates}</p>
        <p>{trip.places}</p>
        <button className="mini-button" type="button" onClick={onOpen}>Abrir viagem</button>
      </div>
    </article>
  );
}

function TripDetails({ trip, onRoute, onEdit, onFinish }) {
  if (!trip) return null;
  const packing = trip.packingList || defaultPackingList;

  return (
    <section>
      <div className="section-head">
        <div>
          <span className="eyebrow">Pagina da viagem</span>
          <h2>{trip.name}</h2>
        </div>
        <div className="action-row">
          <button className="secondary-button" type="button" onClick={() => onEdit(trip)}>Editar viagem</button>
          {trip.status !== "finished" && <button className="secondary-button" type="button" onClick={() => onFinish(trip)}>Finalizar viagem</button>}
          <button className="primary-button" type="button" onClick={onRoute}>Abrir roteiro</button>
        </div>
      </div>

      <Moodboard images={trip.images || []} variant="gallery" />

      <div className="detail-grid">
        <InfoCard title="Data da viagem" value={trip.dates} />
        <InfoCard title="Fonte externa" value={trip.sourceUrl} link />
        <InfoCard title="Seguro viagem" value={trip.insuranceRequired === "yes" ? `Sim - ${trip.insuranceTicket || "sem bilhete"}` : "Nao informado"} />
        <InfoCard title="Reserva voos" value={`Reserva: ${trip.flightReservation || "-"} | Localizador: ${trip.flightLocator || "-"}`} />
      </div>

      <Panel title="Documentos necessarios">
        <Checklist items={Array.isArray(trip.documents) ? trip.documents : []} />
      </Panel>

      <Panel title="Tarefas">
        <Checklist items={Array.isArray(trip.tasks) ? trip.tasks : []} />
      </Panel>

      <Panel title="Lista de mala">
        {packing.map((group) => (
          <div className="packing-group" key={group.section}>
            <h4>{group.section}</h4>
            <Checklist items={group.items} />
          </div>
        ))}
      </Panel>

      <Panel title="Passagens aereas">
        <p className="preserve">{trip.flightItinerary || "Itinerario nao informado."}</p>
      </Panel>

      <Panel title="Acomodacao">
        <div className="detail-grid">
          <InfoCard title="Check-in" value={trip.accommodationCheckin} />
          <InfoCard title="Check-out" value={trip.accommodationCheckout} />
          <InfoCard title="Reserva" value={trip.accommodationLink} link />
          <InfoCard title="Endereco" value={trip.accommodationAddress} />
        </div>
        <p className="preserve">{trip.accommodationArrival}</p>
      </Panel>

      <Panel title="Passagens aereas/trens de locomocao">
        <Checklist items={Array.isArray(trip.mobilityTickets) ? trip.mobilityTickets : []} />
      </Panel>
    </section>
  );
}

function InfoCard({ title, value, link = false }) {
  return (
    <article className="info-card">
      <span>{title}</span>
      {link && value ? <a href={value} target="_blank" rel="noreferrer">{value}</a> : <strong>{value || "-"}</strong>}
    </article>
  );
}

function Checklist({ items }) {
  if (!items.length) return <p className="muted">Nada informado ainda.</p>;
  return (
    <div className="checklist">
      {items.map((item, index) => (
        <label className="check-row" key={`${item}-${index}`}>
          <input type="checkbox" />
          {item}
        </label>
      ))}
    </div>
  );
}

function RouteNotebook({ trip }) {
  const route = trip?.itinerary || parseItineraryMarkdown("");

  return (
    <section>
      <div className="section-head">
        <div>
          <span className="eyebrow">Roteiro</span>
          <h2>{trip?.name || "Viagem"}</h2>
        </div>
      </div>

      <div className="notebook">
        <span className="script">roteiro em caderno</span>
        <p>{route.totalDays ? `${route.totalDays} dias totais` : "Cole o Markdown do roteiro na criacao da viagem para ver tudo organizado aqui."}</p>
        {route.cities.map((city) => (
          <section className="city-page" key={city.name}>
            <h3>{city.name}</h3>
            {city.days.map((day) => (
              <article className="day-page" key={`${city.name}-${day.label}`}>
                <span>{day.label}</span>
                <strong>{day.title || "Dia sem titulo"}</strong>
                {Object.entries(day.sections).map(([section, items]) => (
                  <div key={section}>
                    <h4>#{section}</h4>
                    <ul>
                      {items.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
                    </ul>
                  </div>
                ))}
              </article>
            ))}
          </section>
        ))}
      </div>
    </section>
  );
}

export default App;
