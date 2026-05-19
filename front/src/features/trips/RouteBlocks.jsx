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

function routeHeadingKind(text) {
  if (/📍|\b\d{1,2}[\s–-]/.test(text)) return "date";
  if (/🇩🇪|🇨🇳|🇧🇷|🇫🇷|🇮🇹|🇪🇸|🇺🇸|🇬🇧|🇯🇵|🇰🇷/.test(text)) return "country";
  if (/✈️|🚄|🚆|🚇|🚌|🚗|🚕/.test(text)) return "transport";
  if (/🏨|🛏️|hotel|dormir|hospedagem/i.test(text)) return "stay";
  if (/🍽️|🍜|☕|🍺|comida|food|gastronomia/i.test(text)) return "food";
  if (/💰|budget|total|estimado/i.test(text)) return "budget";
  return "default";
}

export function RouteBlocks({ blocks }) {
  return blocks.map((block) => {
    if (block.type === "h1") return <h3 className={`route-title ${routeHeadingKind(block.text)}`} key={block.id}>{inlineMarkdown(block.text)}</h3>;
    if (block.type === "h2") return <h4 className={`route-subtitle ${routeHeadingKind(block.text)}`} key={block.id}>{inlineMarkdown(block.text)}</h4>;
    if (block.type === "h3") return <h5 className={`route-small-title ${routeHeadingKind(block.text)}`} key={block.id}>{inlineMarkdown(block.text)}</h5>;
    if (block.type === "divider") return <hr className="route-divider" key={block.id} />;
    if (block.type === "list") {
      return (
        <ul className="route-list" key={block.id}>
          {block.items.map((item, itemIndex) => <li key={`${item}-${itemIndex}`}>{inlineMarkdown(item)}</li>)}
        </ul>
      );
    }
    if (block.type === "ordered-list") {
      return (
        <ol className="route-list ordered" key={block.id}>
          {block.items.map((item, itemIndex) => <li key={`${item}-${itemIndex}`}>{inlineMarkdown(item)}</li>)}
        </ol>
      );
    }
    if (block.type === "note") {
      return <aside className="route-note" key={block.id}>{inlineMarkdown(block.text)}</aside>;
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
  });
}
