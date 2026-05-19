import { describe, expect, it } from "vitest";
import { extractRouteHeadings, groupRouteBlocks, markdownToBlocks, paginateRouteBlocks } from "./itinerary.js";

describe("markdownToBlocks", () => {
  it("parses headings, lists, tasks and tables", () => {
    const blocks = markdownToBlocks(`# Overview
## Checklist
- [x] Passaporte
- item livre

| Cidade | Temperatura |
|---|---|
| Frankfurt | 5-12C |`);

    expect(blocks).toEqual([
      { type: "h1", text: "Overview", id: 0 },
      { type: "h2", text: "Checklist", id: 1 },
      { type: "task", checked: true, text: "Passaporte", id: 2 },
      { type: "list", items: ["item livre"], id: 4 },
      {
        type: "table",
        headers: ["Cidade", "Temperatura"],
        rows: [["Frankfurt", "5-12C"]],
        id: 5
      }
    ]);
  });

  it("parses route notes and ordered lists", () => {
    const blocks = markdownToBlocks(`> Chegar cedo para evitar fila
> Comprar ingresso antes

1. Metro ate o centro
2. Caminhar ate o hotel`);

    expect(blocks).toEqual([
      { type: "note", text: "Chegar cedo para evitar fila Comprar ingresso antes", id: 0 },
      { type: "ordered-list", items: ["Metro ate o centro", "Caminhar ate o hotel"], id: 3 }
    ]);
  });

  it("returns a readable empty state for blank markdown", () => {
    expect(markdownToBlocks("   ")).toEqual([
      { type: "p", text: "Nenhum roteiro cadastrado ainda." }
    ]);
  });
});

describe("groupRouteBlocks", () => {
  it("keeps consecutive headings with their first content block", () => {
    const blocks = markdownToBlocks(`# Clima esperado
## Novembro
| Cidade | Temperatura |
|---|---|
| Frankfurt | 5-12C |

---

# Proximo dia
- Caminhar`);

    expect(groupRouteBlocks(blocks)[0]).toEqual([
      { type: "h1", text: "Clima esperado", id: 0 },
      { type: "h2", text: "Novembro", id: 1 },
      {
        type: "table",
        headers: ["Cidade", "Temperatura"],
        rows: [["Frankfurt", "5-12C"]],
        id: 2
      }
    ]);
  });
});

describe("paginateRouteBlocks", () => {
  it("does not split a heading from its immediate content", () => {
    const blocks = markdownToBlocks(`# Intro
- A
- B

# Clima esperado
| Cidade | Temperatura |
|---|---|
| Frankfurt | 5-12C |
| Munique | 3-10C |`);

    const pages = paginateRouteBlocks(blocks, 5);
    const flattenedColumns = pages.flat();
    const climateColumn = flattenedColumns.find((column) => column.some((block) => block.text === "Clima esperado"));

    expect(climateColumn.map((block) => block.type)).toEqual(["h1", "table"]);
  });

  it("never creates completely empty pages", () => {
    const blocks = markdownToBlocks(`# Dia 1
- Chegada

# Dia 2
- Museu

# Dia 3
- Volta`);

    const pages = paginateRouteBlocks(blocks, 4);

    expect(pages.length).toBeGreaterThan(0);
    expect(pages.every((page) => page.some((column) => column.length > 0))).toBe(true);
  });
});

describe("extractRouteHeadings", () => {
  it("collects unique headings from markdown", () => {
    expect(extractRouteHeadings(`# Intro
## Lisboa
### Belém
## Lisboa`)).toEqual(["Intro", "Lisboa", "Belém"]);
  });
});
