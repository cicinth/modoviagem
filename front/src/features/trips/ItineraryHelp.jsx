import { useState } from "react";

const promptExample = `Transforme meu roteiro em Markdown compativel com o Viajario.
Use titulos para lugares assim:
# Portugal
## Lisboa
### Dia 1 - 12/06
- Chegada no aeroporto
- Check-in no hotel
> Nota: separar cidades e paises em titulos, sem emojis, sem HTML.`;

export function ItineraryHelp() {
  const [open, setOpen] = useState(false);

  return (
    <div className="itinerary-help">
      <button
        className="info-button"
        type="button"
        aria-expanded={open}
        aria-label="Ajuda sobre roteiro em Markdown"
        onClick={() => setOpen((current) => !current)}
      >
        i
      </button>

      {open ? (
        <aside className="itinerary-help-card">
          <h3>Roteiro em Markdown</h3>
          <p>
            Se gerar roteiro em outro lugar, peça para converter para Markdown antes de colar aqui. O diário usa os
            títulos do roteiro como sugestões de cidade e país.
          </p>
          <ul>
            <li>Use `# País` para país.</li>
            <li>Use `## Cidade` para cidade.</li>
            <li>Use `### Dia ou data` para etapas.</li>
            <li>Use listas com `- item` para passeios, reservas e observações.</li>
          </ul>
          <div className="prompt-tip">
            <span>Prompt sugerido</span>
            <pre>{promptExample}</pre>
          </div>
        </aside>
      ) : null}
    </div>
  );
}
