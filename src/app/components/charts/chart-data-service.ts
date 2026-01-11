import { computed, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, of } from 'rxjs';
import { ChartData } from '../../models/chart.model';
import { NEW_CUSTOMERS_STATS, PROJECTS, SALES_STATS } from './chart-data.constant';

const DEFAULT_SERIES = [
  { key: 'primary', color: '#007BFF' },
  { key: 'secondary', color: '#00D4FF' },
] as const;

type SeriesKey = typeof DEFAULT_SERIES[number]['key'];
type SeriesSelectors<T> = Record<SeriesKey, (item: T) => number>;

@Injectable({ providedIn: 'root' })
export class ChartDataService {
  private createChartDataSignal<T>(
    source$: Observable<T[]>,
    initialValue: T[],
    selectors: SeriesSelectors<T>,
    labelSelector: (item: T) => string
  ) {
    const raw = toSignal(source$, { initialValue });

    return computed<ChartData[]>(() =>
      raw().map((item) => ({
        label: labelSelector(item),
        value: selectors.primary(item),
        secondaryValue: selectors.secondary(item),
        color: DEFAULT_SERIES[0].color,
        secondaryColor: DEFAULT_SERIES[1].color,
      }))
    );
  }

  readonly salesChartData = this.createChartDataSignal(
    of(SALES_STATS),
    SALES_STATS,
    { primary: (x) => x.sales, secondary: (x) => x.costs },
    (x) => x.category
  );

  readonly newCustomersChartData = this.createChartDataSignal(
    of(NEW_CUSTOMERS_STATS),
    NEW_CUSTOMERS_STATS,
    { primary: (x) => x.currentYear, secondary: (x) => x.lastYear },
    (x) => x.category
  );

  readonly projectsChartData = this.createChartDataSignal(
    of(PROJECTS),
    PROJECTS,
    { primary: (x) => x.overall, secondary: (x) => x.completed },
    () => 'Projects'
  );
}