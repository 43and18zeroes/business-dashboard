/* =========================
 dragable-table-component.ts
========================= */

import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTable, MatTableModule } from '@angular/material/table';
import { DragAutoScrollDirective, AutoScrollTarget } from './drag-autoscroll.directive';

export type RowData = Record<string, unknown>;

@Component({
  selector: 'app-dragable-table-component',
  standalone: true,
  imports: [CdkDropList, CdkDrag, MatTableModule, MatIconModule, DragAutoScrollDirective],
  templateUrl: './dragable-table-component.html',
  styleUrl: './dragable-table-component.scss',
})
export class DragableTableComponent {
  @ViewChild('table', { static: true }) table!: MatTable<RowData>;
  @ViewChild('scrollContainer', { read: ElementRef }) scrollContainer?: ElementRef<HTMLElement>;

  displayedColumns: string[] = [];
  dataSource: RowData[] = [];

  @Input() cellFormatter?: (key: string, value: unknown, row: RowData) => string;

  private _data: readonly RowData[] = [];
  private _columns?: readonly string[];

  @Input()
  set data(value: readonly RowData[] | null | undefined) {
    this._data = value ?? [];
    this.dataSource = [...this._data];
    this.recomputeColumns();
    this.table?.renderRows();
  }

  @Input()
  set columns(value: readonly string[] | null | undefined) {
    this._columns = value ?? undefined;
    this.recomputeColumns();
    this.table?.renderRows();
  }

  @Input() idKey: string = 'id';
  @Input() entity?: string;

  @Input() autoScroll = false;
  @Input() autoScrollEdgePx = 40;
  @Input() autoScrollMaxStep = 18;
  @Input() autoScrollTarget: AutoScrollTarget = 'self';

  drop(event: CdkDragDrop<RowData[]>) {
    const fromIndex = event.previousIndex;
    const toIndex = event.currentIndex;

    if (fromIndex === toIndex) return;

    const draggedRow = event.item.data as RowData;

    const orderBefore = this.dataSource.map((row) => String(row[this.idKey]));

    moveItemInArray(this.dataSource, fromIndex, toIndex);

    const orderAfter = this.dataSource.map((row) => String(row[this.idKey]));

    const payload = {
      type: 'table.reorder',
      entity: this.entity ?? 'unknown',
      moved: { key: this.idKey, value: draggedRow[this.idKey] },
      fromIndex,
      toIndex,
      orderBefore,
      orderAfter,
    };

    console.log('[TABLE REORDER]', payload);

    this.table.renderRows();
  }

  private recomputeColumns() {
    const allColumns = this.computeColumns(this.dataSource);
    this.displayedColumns = this._columns?.length
      ? this._columns.filter((col) => allColumns.includes(col))
      : allColumns;
  }

  private computeColumns(rows: RowData[]): string[] {
    const seen = new Set<string>();
    const cols: string[] = [];

    for (const row of rows) {
      for (const key of Object.keys(row)) {
        if (!seen.has(key)) {
          seen.add(key);
          cols.push(key);
        }
      }
    }

    return cols;
  }

  formatHeader(key: string): string {
    return key
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  formatCell(key: string, value: unknown, row: RowData): string {
    if (this.cellFormatter) return this.cellFormatter(key, value, row);
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }
}
