const FILTER_RESERVED_CHARS = /[,()]/g;
const WILDCARD_CHARS = /[%*_]/g;
const WHITESPACE = /\s+/g;

export function normalizePostgrestSearchTerm(value: string) {
  return value
    .trim()
    .replace(FILTER_RESERVED_CHARS, " ")
    .replace(WILDCARD_CHARS, " ")
    .replace(WHITESPACE, " ")
    .slice(0, 120);
}

export function ilikeContains(value: string) {
  const term = normalizePostgrestSearchTerm(value);

  return term ? `%${term}%` : null;
}

export function buildOrIlikeFilter(columns: readonly string[], value: string) {
  const pattern = ilikeContains(value);

  if (!pattern) {
    return null;
  }

  return columns.map((column) => `${column}.ilike.${pattern}`).join(",");
}
