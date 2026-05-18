const tagPattern = /^#([a-zA-Z_]+)\s*(.*)$/;

export function parseItineraryMarkdown(markdown) {
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

export const itineraryHelp = `#dias_totais 7

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
