// SPEC-001-R9: .md 先頭の YAML フロントマター（`---` で挟まれたメタ情報）を本文と分離し、
// メタ情報を key/value に解析する（設計 4.9）。
// 入力は fileLoader でデコード済みの文字列を前提とする。

import { load as loadYaml } from "js-yaml";

export interface FrontMatterEntry {
  /** 項目名 */
  key: string;
  /** 表示用に文字列化した値（オブジェクト/配列は JSON 文字列に整形） */
  value: string;
}

export interface ParsedMarkdown {
  /** フロントマターの key/value 一覧。フロントマターが無ければ空配列 */
  entries: FrontMatterEntry[];
  /** フロントマターを除いた本文（markdownRenderer に渡す） */
  body: string;
}

// 先頭のフロントマター開始/終了区切りにマッチする正規表現。
// - 先頭が `---`（行頭）で始まり、次の `---` または `...`（行頭）で終わる。
// - 開始区切りの直後に改行、終了区切りの直後は改行または文字列終端。
const FRONT_MATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n(?:---|\.\.\.)[ \t]*(?:\r?\n|$)/;

/**
 * 解析済み YAML 値を表示用の文字列に整形する。
 * - 文字列/数値/真偽値: そのまま文字列化（末尾の余分な改行は除去）。
 * - オブジェクト/配列: JSON 文字列化。
 */
function stringifyValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "string") {
    return value.replace(/\n+$/, "");
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

/**
 * SPEC-001-R9: 先頭フロントマターを分離して解析する。
 * - 先頭に `---` ブロックが無ければ `entries: []`, `body: source`（準正常系: フロントマター無し）。
 * - YAML として解釈できない場合もフロントマター無しとして扱い、本文全体を body にする（エラーにしない。堅牢性優先）。
 */
export function parseFrontMatter(source: string): ParsedMarkdown {
  const match = source.match(FRONT_MATTER_PATTERN);

  // 先頭がフロントマターで始まらない → 分離しない
  if (!match) {
    return { entries: [], body: source };
  }

  const yamlBlock = match[1] ?? "";
  const body = source.slice(match[0].length);

  let parsed: unknown;
  try {
    parsed = loadYaml(yamlBlock);
  } catch {
    // 不正な YAML はフロントマター無しとして扱う（本文全体を維持）
    return { entries: [], body: source };
  }

  // トップレベルがオブジェクト（マップ）でない場合はフロントマターとして展開しない
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { entries: [], body: source };
  }

  const entries: FrontMatterEntry[] = Object.entries(
    parsed as Record<string, unknown>,
  ).map(([key, value]) => ({ key, value: stringifyValue(value) }));

  return { entries, body };
}
