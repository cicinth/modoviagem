const { useEffect, useMemo, useState } = React;

const defaultPackingList = [
  {
    section: "Mochila",
    items: [
      "Doleira",
      "Passaporte",
      "RG",
      "Carregador do celular",
      "Fones",
      "Uma muda de roupa",
      "Carteira com cartao",
      "Dinheiro",
      "Oculos de sol",
      "Carregador portatil",
      "Protetor de pescoco",
      "Carteirinha de vacina",
      "Escova de dente",
      "Pasta de dente",
      "Fio dental",
      "Protetor solar de rosto",
      "Serum",
      "Perfume de bolso",
      "Gloss",
      "Maquiagem essencial",
      "Xuxinha de cabelo",
      "Mascara",
      "Adaptador universal de tomada",
      "Kindle",
      "Carregador do Kindle",
      "Microfone para videos",
      "Tripe para videos"
    ]
  },
  {
    section: "Mala",
    items: [
      "Shampoo",
      "Condicionador",
      "Matizador",
      "Sabonetes",
      "Oleo de cabelo",
      "Creme",
      "Sabonete de rosto",
      "Protetor solar",
      "Maquiagem",
      "Desodorante",
      "Creme de corpo",
      "Tenis",
      "Sapato",
      "Escova de cabelo",
      "Acessorios",
      "Toalha de banho microfibra",
      "Calcinhas",
      "Sutia",
      "Lente de contato",
      "Pijama",
      "Looks",
      "Roupas comfy",
      "Meias",
      "Bolsas para sair",
      "Airtag",
      "Cadeado",
      "Guarda chuva"
    ]
  }
];

const emptyTrip = {
  name: "",
  status: "upcoming",
  sourceUrl: "",
  images: "",
  dates: "",
  documents: "",
  tasks: "",
  useDefaultPacking: true,
  packingSourceUrl: "",
  packingList: "",
  insuranceRequired: "no",
  insuranceTicket: "",
  flightItinerary: "",
  flightReservation: "",
  flightLocator: "",
  accommodationCheckin: "",
  accommodationCheckout: "",
  accommodationLink: "",
  accommodationAddress: "",
  accommodationArrival: "",
  mobilityTickets: "",
  itinerarySourceUrl: "",
  itineraryMarkdown: ""
};

const sampleTrips = [
  {
    id: "rio",
    name: "Rio de Janeiro",
    status: "upcoming",
    sourceUrl: "https://www.notion.so/Rio-de-Janeiro-32150c588c648088909ed0b762a08da3",
    dates: "02/04/2026 a 05/04/2026",
    images: [
      "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=900&q=84",
      "https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?auto=format&fit=crop&w=900&q=84"
    ],
    places: "Copacabana",
    sourceKind: "Notion"
  },
  {
    id: "nordeste",
    name: "Nordeste",
    status: "upcoming",
    sourceUrl: "https://www.notion.so/Nordeste-ce75cfa355ef4e2d91e692527ba9e267",
    dates: "10 dias, a definir",
    images: [
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=900&q=84",
      "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=900&q=84"
    ],
    places: "Patos, Joao Pessoa e Pipa",
    sourceKind: "Notion"
  },
  {
    id: "eurotrip",
    name: "EuroTrip",
    status: "finished",
    sourceUrl: "https://www.notion.so/EuroTrip-69531e50127448a193bebbbf0f9738b4",
    dates: "18/10/2025 a 07/11/2025",
    images: [
      "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=900&q=84",
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=84",
      "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&fit=crop&w=900&q=84"
    ],
    places: "Italia, Franca, Suica e Inglaterra",
    sourceKind: "Notion"
  },
  {
    id: "colombia",
    name: "Colombia Trip",
    status: "finished",
    sourceUrl: "https://www.notion.so/Colombia-Trip-4c39ad396de64e06b8a90a0aad9b045b",
    dates: "07/04/2024 a 18/04/2024",
    images: [
      "https://images.unsplash.com/photo-1583531352515-8884af319dc1?auto=format&fit=crop&w=900&q=84",
      "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=900&q=84"
    ],
    places: "Bogota e Cartagena",
    sourceKind: "Notion"
  }
];


const tagPattern = /^#([a-zA-Z_]+)\s*(.*)$/;

function parseItineraryMarkdown(markdown) {
  const result = {
    totalDays: "",
    cities: []
  };

  let currentCity = null;
  let currentDay = null;
  let currentSection = null;

  markdown.split(/\r?\n/).forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) return;

    const tagMatch = line.match(tagPattern);
    if (tagMatch) {
      const [, tag, value] = tagMatch;

      if (tag === "dias_totais") {
        result.totalDays = value;
        currentSection = null;
        return;
      }

      if (tag === "cidade") {
        currentCity = { name: value || "Cidade sem nome", days: [] };
        result.cities.push(currentCity);
        currentDay = null;
        currentSection = null;
        return;
      }

      if (tag === "dia") {
        if (!currentCity) {
          currentCity = { name: "Cidade", days: [] };
          result.cities.push(currentCity);
        }
        currentDay = { label: value || `Dia ${currentCity.days.length + 1}`, title: "", sections: {} };
        currentCity.days.push(currentDay);
        currentSection = null;
        return;
      }

      if (tag === "titulo") {
        if (currentDay) currentDay.title = value;
        currentSection = null;
        return;
      }

      if (currentDay) {
        currentSection = tag;
        currentDay.sections[currentSection] = value ? [value] : [];
      }
      return;
    }

    if (currentDay && currentSection) {
      currentDay.sections[currentSection].push(line.replace(/^[-*]\s*/, ""));
    }
  });

  return result;
}

const itineraryHelp = `#dias_totais 7

#cidade Lisboa
#dia 1
#titulo Chegada e passeio leve
#passeios
- Check-in
- Miradouro
- Jantar
#comidas
- Restaurante que quero testar
#observacoes
- Comprar bilhete de transporte

#dia 2
#titulo Belem e museus
#passeios
- Mosteiro dos Jeronimos
- Torre de Belem`;



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


ReactDOM.createRoot(document.getElementById("root")).render(<App />);
