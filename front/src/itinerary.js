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

export function markdownToBlocks(markdown) {
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

    if (line.startsWith(">")) {
      const quotes = [];
      const quoteStart = index;

      while (index < lines.length && lines[index].trim().startsWith(">")) {
        quotes.push(lines[index].trim().replace(/^>\s?/, ""));
        index += 1;
      }

      blocks.push({ type: "note", text: quotes.join(" "), id: quoteStart });
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

    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      const listStart = index;

      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\.\s+/, ""));
        index += 1;
      }

      blocks.push({ type: "ordered-list", items, id: listStart });
      continue;
    }

    blocks.push({ type: "p", text: line, id: index });
    index += 1;
  }

  return blocks;
}

export function routeBlockWeight(block) {
  if (block.type === "h1") return 3;
  if (block.type === "h2") return 2.2;
  if (block.type === "h3") return 1.4;
  if (block.type === "divider") return 1;
  if (block.type === "list") return 1.4 + block.items.length * 0.9;
  if (block.type === "ordered-list") return 1.4 + block.items.length * 0.9;
  if (block.type === "note") return Math.max(1.4, Math.ceil(String(block.text || "").length / 90));
  if (block.type === "task") return 1.5;
  if (block.type === "table") return 2.5 + block.rows.length * 1.2;
  return Math.max(1.2, Math.ceil(String(block.text || "").length / 95));
}

function isRouteHeading(block) {
  return ["h1", "h2", "h3"].includes(block.type);
}

function routeUnitWeight(unit) {
  return unit.reduce((total, block) => total + routeBlockWeight(block), 0);
}

export function groupRouteBlocks(blocks) {
  const units = [];
  let index = 0;

  while (index < blocks.length) {
    const block = blocks[index];
    const unit = [block];
    index += 1;

    if (isRouteHeading(block)) {
      while (index < blocks.length && isRouteHeading(blocks[index])) {
        unit.push(blocks[index]);
        index += 1;
      }

      if (index < blocks.length && blocks[index].type !== "divider") {
        unit.push(blocks[index]);
        index += 1;
      }
    }

    units.push(unit);
  }

  return units;
}

export function paginateRouteBlocks(blocks, columnLimit = 24) {
  const pages = [];
  let currentPage = [[], []];
  let currentColumn = 0;
  let currentWeight = 0;

  groupRouteBlocks(blocks).forEach((unit) => {
    const weight = routeUnitWeight(unit);

    if (currentPage[currentColumn].length && currentWeight + weight > columnLimit) {
      currentColumn += 1;
      currentWeight = 0;
    }

    if (currentColumn > 1) {
      pages.push(currentPage);
      currentPage = [[], []];
      currentColumn = 0;
    }

    currentPage[currentColumn].push(...unit);
    currentWeight += weight;
  });

  if (currentPage[0].length || currentPage[1].length) {
    pages.push(currentPage);
  }

  return pages.length ? pages : [[blocks, []]];
}

export function extractRouteHeadings(markdown) {
  return markdownToBlocks(markdown)
    .filter((block) => ["h1", "h2", "h3"].includes(block.type))
    .map((block) => block.text)
    .filter(Boolean)
    .filter((value, index, values) => values.indexOf(value) === index);
}
