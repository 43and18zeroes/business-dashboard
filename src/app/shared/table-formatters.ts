// table-formatters.ts

export type RowData = Record<string, unknown>;

export type CellFormatter = (
  key: string,
  value: unknown,
  row: RowData
) => string;

export const defaultCellFormatter: CellFormatter = (_key, value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

export const transactionCellFormatter: CellFormatter = (key, value, row) => {
  if (key === 'cost' && (typeof value === 'string' || typeof value === 'number')) {
    return `$${value}`;
  }

  return defaultCellFormatter(key, value, row);
};
