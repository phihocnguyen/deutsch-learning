import type { GrammarSource } from "./types";
const accessedAt = "2026-11-16";
export function goethe(page: number, section: string, supports: string): GrammarSource {
  return { publisher: "Goethe-Institut", title: "Deutsch Online A1 — Redemittel und Grammatik", url: `https://lernen.goethe.de/deutschonline/A1/PDF/DE/deutschonline_Redemittel_und_Grammatik_1-18.pdf#page=${page}`, section: `Trang PDF ${page} · ${section}`, accessedAt, supports };
}
export function dw(page: number, section: string): GrammarSource {
  return { publisher: "Deutsche Welle", title: "Nicos Weg A2 — Grammatikübersicht", url: `https://static.dw.com/downloads/59838099/grammatikuebersicht-nicos-weg-a2.pdf#page=${page}`, section: `Trang PDF ${page} · ${section}`, accessedAt, supports: "Phân bổ chủ đề trong khóa A2 của DW; đây là mục lục, không phải nguồn giải thích quy tắc." };
}
export function ids(path: string, title: string, section: string, supports: string): GrammarSource {
  return { publisher: "Leibniz-Institut für Deutsche Sprache (IDS)", title, url: `https://grammis.ids-mannheim.de/${path}`, section, accessedAt, supports };
}
export function reference(publisher: string, title: string, url: string, section: string, supports: string): GrammarSource {
  return { publisher, title, url, section, supports, accessedAt };
}
