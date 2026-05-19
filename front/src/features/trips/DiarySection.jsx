import { useEffect, useMemo, useState } from "react";
import { ImageWithFallback } from "../../components/ImageWithFallback.jsx";
import { Field, TextArea, TextInput } from "../../components/formFields.jsx";
import { extractRouteHeadings } from "../../itinerary.js";
import { diaryPlaceTypes, toDiaryForm, toDiaryPayload } from "./diaryModel.js";

const VISUAL_LIMIT = 5;

function placeTypeLabel(placeType) {
  return placeType === diaryPlaceTypes.COUNTRY ? "País" : "Cidade";
}

function EntryCollage({ entry, onOpen }) {
  const photos = entry.photos || [];
  const visiblePhotos = photos.slice(0, VISUAL_LIMIT);
  const hiddenCount = Math.max(photos.length - visiblePhotos.length, 0);

  return (
    <article className="diary-card">
      <button className="diary-card-open" type="button" onClick={() => onOpen(entry)}>
        <span className="diary-card-chip">{placeTypeLabel(entry.placeType)}</span>
        <h3>{entry.placeName}</h3>
        {entry.note ? <p>{entry.note}</p> : <p>Sem nota registrada.</p>}
      </button>

      <div className="diary-collage" aria-hidden="true">
        {visiblePhotos.map((photo, index) => (
          <ImageWithFallback
            key={`${photo.url}-${index}`}
            src={photo.url}
            fallback="foto"
            className={`diary-photo photo-${(index % 5) + 1}`}
          />
        ))}
        {hiddenCount > 0 ? (
          <button className="diary-more" type="button" onClick={() => onOpen(entry)}>
            +{hiddenCount}
          </button>
        ) : null}
      </div>
    </article>
  );
}

function DiaryEditorModal({ routeSuggestions, initialEntry, onSave, onClose, loading = false, error = "" }) {
  const [form, setForm] = useState(() => toDiaryForm(initialEntry));

  useEffect(() => {
    setForm(toDiaryForm(initialEntry));
  }, [initialEntry]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function useSuggestion(value) {
    update("placeName", value);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await onSave(toDiaryPayload(form));
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Diário da viagem">
      <article className="modal-card diary-modal">
        <div className="modal-header">
          <div>
            <h2>{initialEntry?.id ? "Editar memória" : "Nova memória"}</h2>
            <p>Registre notas e fotos para uma cidade ou país.</p>
          </div>
          <button className="back-button" type="button" onClick={onClose}>Fechar</button>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <form className="diary-editor" onSubmit={handleSubmit}>
          <div className="form-grid two">
            <Field label="Tipo">
              <select value={form.placeType} onChange={(event) => update("placeType", event.target.value)}>
                <option value={diaryPlaceTypes.CITY}>Cidade</option>
                <option value={diaryPlaceTypes.COUNTRY}>País</option>
              </select>
            </Field>
            <TextInput
              label="Lugar"
              value={form.placeName}
              onChange={(value) => update("placeName", value)}
              placeholder="Ex.: Lisboa, Portugal"
            />
          </div>

          {routeSuggestions.length ? (
            <div className="suggestions">
              <span className="suggestions-label">Sugestões do roteiro</span>
              <div className="suggestion-list">
                {routeSuggestions.slice(0, 8).map((item) => (
                  <button key={item} className="suggestion-chip" type="button" onClick={() => useSuggestion(item)}>
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <TextArea
            label="Nota"
            value={form.note}
            onChange={(value) => update("note", value)}
            placeholder="Como foi esse lugar? O que vale lembrar?"
            rows={5}
          />

          <TextArea
            label="Fotos por link"
            value={form.photosText}
            onChange={(value) => update("photosText", value)}
            placeholder="Uma URL por linha. Use | para adicionar legenda opcional."
            rows={6}
          />

          <div className="actions">
            <button className="button primary" type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar memória"}
            </button>
            <button className="button ghost" type="button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </article>
    </div>
  );
}

function DiaryViewerModal({ entry, onEdit, onDelete, onClose }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={entry.placeName}>
      <article className="modal-card diary-viewer">
        <div className="modal-header">
          <div>
            <h2>{entry.placeName}</h2>
            <p>{placeTypeLabel(entry.placeType)}</p>
          </div>
          <button className="back-button" type="button" onClick={onClose}>Fechar</button>
        </div>

        {entry.note ? <p className="diary-note">{entry.note}</p> : <p className="diary-note empty">Sem nota registrada.</p>}

        <div className="diary-full-grid">
          {(entry.photos || []).map((photo, index) => (
            <figure className="diary-full-photo" key={`${photo.url}-${index}`}>
              <ImageWithFallback src={photo.url} fallback="foto" />
              {photo.caption ? <figcaption>{photo.caption}</figcaption> : null}
            </figure>
          ))}
        </div>

        <div className="actions diary-viewer-actions">
          <button className="button secondary" type="button" onClick={() => onEdit(entry)}>Editar</button>
          <button className="button ghost" type="button" onClick={() => onDelete(entry)}>Excluir</button>
          <button className="button ghost" type="button" onClick={onClose}>Fechar</button>
        </div>
      </article>
    </div>
  );
}

export function DiarySection({ trip, routeSuggestions = [], onCreate, onUpdate, onDelete }) {
  const suggestions = useMemo(() => extractRouteHeadings(trip.itineraryMarkdown || ""), [trip.itineraryMarkdown]);
  const combinedSuggestions = useMemo(() => {
    return [...new Set([...routeSuggestions, ...suggestions, ...(trip.diaryEntries || []).map((entry) => entry.placeName)])];
  }, [routeSuggestions, suggestions, trip.diaryEntries]);
  const entries = trip.diaryEntries || [];
  const [editorEntry, setEditorEntry] = useState(null);
  const [viewerEntry, setViewerEntry] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function closeEditor() {
    if (saving) return;
    setEditorEntry(null);
    setError("");
  }

  function closeViewer() {
    setViewerEntry(null);
  }

  async function saveEntry(payload) {
    setSaving(true);
    setError("");

    try {
      if (editorEntry?.id) {
        await onUpdate(editorEntry.id, payload);
      } else {
        await onCreate(payload);
      }

      setEditorEntry(null);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  async function removeEntry(entry) {
    if (!window.confirm(`Excluir a memória de ${entry.placeName}?`)) {
      return;
    }

    try {
      await onDelete(entry.id);
      setViewerEntry(null);
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  return (
    <section className="panel diary-section">
      <div className="itinerary-header">
        <div>
          <span className="eyebrow">Diário</span>
          <h2>Memórias por cidade ou país</h2>
        </div>
        <button className="button secondary" type="button" onClick={() => setEditorEntry({})}>
          Nova memória
        </button>
      </div>

      {error && editorEntry === null ? <p className="form-error">{error}</p> : null}

      {entries.length ? (
        <div className="diary-grid">
          {entries.map((entry) => (
            <EntryCollage key={entry.id} entry={entry} onOpen={setViewerEntry} />
          ))}
        </div>
      ) : (
        <div className="empty-state diary-empty">
          <span className="script">memórias</span>
          <h3>Nenhuma memória registrada ainda.</h3>
          <p>Adicione notas e fotos para transformar o roteiro em diário.</p>
        </div>
      )}

      {editorEntry !== null ? (
        <DiaryEditorModal
          routeSuggestions={combinedSuggestions}
          initialEntry={editorEntry}
          onSave={saveEntry}
          onClose={closeEditor}
          loading={saving}
          error={error}
        />
      ) : null}

      {viewerEntry ? (
        <DiaryViewerModal
          entry={viewerEntry}
          onEdit={(entry) => {
            setViewerEntry(null);
            setEditorEntry(entry);
          }}
          onDelete={removeEntry}
          onClose={closeViewer}
        />
      ) : null}
    </section>
  );
}
