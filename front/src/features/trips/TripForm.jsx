import { useEffect, useState } from "react";
import { tripsApi } from "../../api.js";
import { Field, TextArea, TextInput } from "../../components/formFields.jsx";
import { emptyTrip, toFormState, toPayload } from "./tripModel.js";

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
