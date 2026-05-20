import { useEffect, useState } from "react";
import { tripsApi } from "../../api.js";
import { Field, TextArea, TextInput } from "../../components/formFields.jsx";
import { ItineraryHelp } from "./ItineraryHelp.jsx";
import { emptyAccommodation, emptyTrip, toFormState, toPayload } from "./tripModel.js";

export function TripForm({ selectedTrip, token, onCancel, onSaved }) {
  const [form, setForm] = useState(() => toFormState(selectedTrip || emptyTrip));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(toFormState(selectedTrip || emptyTrip));
  }, [selectedTrip]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateAccommodation(index, field, value) {
    setForm((current) => ({
      ...current,
      accommodations: current.accommodations.map((item, itemIndex) => (
        itemIndex === index ? { ...item, [field]: value } : item
      ))
    }));
  }

  function addAccommodation() {
    setForm((current) => ({
      ...current,
      accommodations: [...(current.accommodations || []), { ...emptyAccommodation }]
    }));
  }

  function removeAccommodation(index) {
    setForm((current) => ({
      ...current,
      accommodations: current.accommodations.filter((_, itemIndex) => itemIndex !== index)
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = toPayload(form);
      const saved = selectedTrip?.id
        ? await tripsApi.update(selectedTrip.id, payload, token)
        : await tripsApi.create(payload, token);
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
        <button className="back-button" type="button" onClick={onCancel}>← Voltar</button>
        <span className="eyebrow">{selectedTrip ? "Editar viagem" : "Nova viagem"}</span>
        <h2>{selectedTrip ? form.name : "Começar um passaporte"}</h2>
        <p>Preencha o essencial agora. O diário pode crescer aos poucos conforme a viagem ganha forma.</p>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="form-grid">
        <TextInput label="Nome da viagem" value={form.name} onChange={(value) => update("name", value)} placeholder="Ex.: Rio de Janeiro em abril" />
        <TextInput label="Destino" value={form.destination} onChange={(value) => update("destination", value)} placeholder="Cidade, país ou rota" />
        <Field label="Ida">
          <input type="date" value={form.departureDate} onChange={(event) => update("departureDate", event.target.value)} />
        </Field>
        <Field label="Volta">
          <input type="date" value={form.returnDate} onChange={(event) => update("returnDate", event.target.value)} />
        </Field>
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

        {form.hasInsurance ? (
          <TextInput label="Bilhete do seguro" value={form.insuranceTicket} onChange={(value) => update("insuranceTicket", value)} />
        ) : null}

        <div className="form-grid">
          <Field label="Meio de transporte">
            <select value={form.transportType} onChange={(event) => update("transportType", event.target.value)}>
              <option value="">Não informado</option>
              <option value="aviao">Avião</option>
              <option value="trem">Trem</option>
              <option value="onibus">Ônibus</option>
              <option value="carro">Carro</option>
              <option value="barco">Barco</option>
              <option value="outro">Outro</option>
            </select>
          </Field>
        </div>

        {form.transportType === "aviao" ? (
          <div className="form-grid">
            <TextInput label="Número da passagem ou transporte" value={form.transport} onChange={(value) => update("transport", value)} />
            <TextInput label="Número da reserva" value={form.reservationCode} onChange={(value) => update("reservationCode", value)} />
            <TextInput label="Localizador" value={form.locator} onChange={(value) => update("locator", value)} />
          </div>
        ) : null}

        <div className="field-heading">
          <span>Hospedagens</span>
          <button className="button secondary compact" type="button" onClick={addAccommodation}>+ Adicionar</button>
        </div>

        <div className="accommodation-list">
          {(form.accommodations || []).map((accommodation, index) => (
            <div className="accommodation-editor" key={index}>
              <div className="field-heading">
                <span>Hospedagem {index + 1}</span>
                <button className="button ghost compact danger" type="button" onClick={() => removeAccommodation(index)}>Remover</button>
              </div>
              <div className="form-grid">
                <TextInput label="Destino" value={accommodation.destination} onChange={(value) => updateAccommodation(index, "destination", value)} placeholder="Ex.: Lisboa" />
                <TextInput label="Hospedagem" value={accommodation.name} onChange={(value) => updateAccommodation(index, "name", value)} />
                <Field label="Check-in">
                  <input type="datetime-local" value={accommodation.checkInAt} onChange={(event) => updateAccommodation(index, "checkInAt", event.target.value)} />
                </Field>
                <Field label="Check-out">
                  <input type="datetime-local" value={accommodation.checkOutAt} onChange={(event) => updateAccommodation(index, "checkOutAt", event.target.value)} />
                </Field>
                <TextInput label="Observação de datas" value={accommodation.dates} onChange={(value) => updateAccommodation(index, "dates", value)} />
                <TextInput label="Link da reserva" value={accommodation.link} onChange={(value) => updateAccommodation(index, "link", value)} />
                <TextInput label="Endereço" value={accommodation.address} onChange={(value) => updateAccommodation(index, "address", value)} />
              </div>
            </div>
          ))}
          {!(form.accommodations || []).length ? <p className="muted-note">Nenhuma hospedagem adicionada.</p> : null}
        </div>

        <TextArea label="Deslocamentos internos" value={form.internalTransport} onChange={(value) => update("internalTransport", value)} />
      </section>

      <div className="itinerary-form-block">
        <div className="field-heading">
          <span>Roteiro em Markdown</span>
          <ItineraryHelp />
        </div>
        <TextArea label="" value={form.itineraryMarkdown} onChange={(value) => update("itineraryMarkdown", value)} placeholder="# Portugal&#10;## Lisboa&#10;### Dia 1 - Chegada&#10;- Café perto do hotel" rows={8} />
      </div>

      <div className="actions">
        <button className="button primary" type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar viagem"}</button>
        <button className="button ghost" type="button" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
}
