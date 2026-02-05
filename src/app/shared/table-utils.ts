/* =========================
table-utils.ts
========================= */

import { ReorderEvent } from '../components/dragable-table-component/dragable-table-component';

export function formatCurrency(
  value: number,
  locale: string = 'en-US',
  currency: string = 'USD'
): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
}

export function transactionCellFormatter(col: string, value: unknown): string {
  if (col === 'cost' && typeof value === 'number') {
    return formatCurrency(value);
  }
  return String(value ?? '');
}

export function logPersistOrder<T>(
  ev: ReorderEvent<T>,
  opts: { entity: string; idKey: string }
): void {
  console.log('[REORDER] Persist this order in backend:', {
    entity: opts.entity,
    idKey: opts.idKey,
    moved: { from: ev.previousIndex, to: ev.currentIndex },
    orderedIds: ev.orderedIds,
  });
}

export function persistTransactionOrder<T>(ev: ReorderEvent<T>): void {
  logPersistOrder(ev, { entity: 'transactions', idKey: 'txId' });
}

export const TRANSACTION_TABLE_UTILS = {
  cellFormatter: transactionCellFormatter,
  persistOrder: persistTransactionOrder,
} as const;
