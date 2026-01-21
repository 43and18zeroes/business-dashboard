import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, ElementRef, inject, Input, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTable, MatTableModule } from '@angular/material/table';

type RowData = Record<string, unknown>;

@Component({
  selector: 'app-dragable-table-component',
  imports: [CdkDropList, CdkDrag, MatTableModule, MatIconModule],
  templateUrl: './dragable-table-component.html',
  styleUrl: './dragable-table-component.scss',
})
export class DragableTableComponent implements OnDestroy {
  @ViewChild('table', { static: true }) table!: MatTable<RowData>;
  @ViewChild('scrollContainer', { static: true, read: ElementRef })
  scrollContainer!: ElementRef<HTMLElement>;

  private hostEl = inject(ElementRef<HTMLElement>);
  private zone = inject(NgZone);

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

  // ✅ Variante 1: Default AUS, Dashboard schaltet es ein
  @Input() autoScroll = false;
  @Input() autoScrollEdgePx = 40; // Hot zone oben/unten
  @Input() autoScrollMaxStep = 18; // max px pro Frame

  private dragging = false;
  private lastPointerY = 0;
  private rafId: number | null = null;
  private removePointerMove?: () => void;
  private removePointerUp?: () => void;

  ngOnDestroy() {
    this.stopAutoScroll();
  }

  onDragStarted() {
    if (!this.autoScroll) return;

    this.dragging = true;

    this.zone.runOutsideAngular(() => {
      const onMove = (e: PointerEvent) => {
        this.lastPointerY = e.clientY;
      };

      const onUp = () => this.stopAutoScroll();

      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('pointerup', onUp, { passive: true });

      this.removePointerMove = () => window.removeEventListener('pointermove', onMove);
      this.removePointerUp = () => window.removeEventListener('pointerup', onUp);

      this.tickAutoScroll();
    });
  }

  onDragEnded() {
    this.stopAutoScroll();
  }

  private tickAutoScroll() {
    if (!this.dragging) return;

    const container = this.scrollContainer.nativeElement;
    const rect = container.getBoundingClientRect();

    const topZone = rect.top + this.autoScrollEdgePx;
    const bottomZone = rect.bottom - this.autoScrollEdgePx;

    let delta = 0;

    if (this.lastPointerY < topZone) {
      const t = Math.max(0, Math.min(1, (topZone - this.lastPointerY) / this.autoScrollEdgePx));
      delta = -Math.ceil(t * this.autoScrollMaxStep);
    } else if (this.lastPointerY > bottomZone) {
      const t = Math.max(0, Math.min(1, (this.lastPointerY - bottomZone) / this.autoScrollEdgePx));
      delta = Math.ceil(t * this.autoScrollMaxStep);
    }

    if (delta !== 0) {
      container.scrollTop += delta;
    }

    this.rafId = requestAnimationFrame(() => this.tickAutoScroll());
  }

  private stopAutoScroll() {
    this.dragging = false;

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    this.removePointerMove?.();
    this.removePointerUp?.();
    this.removePointerMove = undefined;
    this.removePointerUp = undefined;
  }

  private recomputeColumns() {
    const allColumns = this.computeColumns(this.dataSource);

    // Wenn columns gesetzt sind -> nur diese anzeigen (in der gewünschten Reihenfolge)
    this.displayedColumns = this._columns?.length
      ? this._columns.filter((col) => allColumns.includes(col))
      : allColumns;
  }

  drop(event: CdkDragDrop<RowData[]>) {
    const fromIndex = event.previousIndex;
    const toIndex = event.currentIndex;

    // ✅ nur loggen/ändern wenn wirklich verschoben
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