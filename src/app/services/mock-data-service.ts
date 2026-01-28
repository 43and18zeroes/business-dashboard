import { computed, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, of } from 'rxjs';
import { ChartData } from '../models/chart.model';
import { NEW_CUSTOMERS_STATS, PROJECTS, SALES_STATS, TRANSACTIONS } from './mock-data.constant';
import { ColorService } from './color-service';

type SeriesKey = 'primary' | 'secondary';
type SeriesSelectors<T> = Record<SeriesKey, (item: T) => number>;
type LabelSelector<T> = (item: T) => string;

@Injectable({ providedIn: 'root' })
export class MockDataService {
  constructor(private readonly colors: ColorService) { }

  private readonly primaryColor = computed(() => this.colors.tokens().primary);
  private readonly secondaryColor = computed(() => this.colors.tokens().secondary);

  private createChartDataSignal<T>(
    source$: Observable<readonly T[]>,
    initialValue: readonly T[],
    selectors: SeriesSelectors<T>,
    labelSelector: LabelSelector<T>
  ) {
    const raw = toSignal(source$, { initialValue: [...initialValue] as T[] });

    return computed<ChartData[]>(() => {
      const primary = this.primaryColor();
      const secondary = this.secondaryColor();

      return raw().map((item) => ({
        label: labelSelector(item),
        value: selectors.primary(item),
        secondaryValue: selectors.secondary(item),
        color: primary,
        secondaryColor: secondary,
      }));
    });
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

  readonly projectsChartData = computed<ChartData[]>(() => {
    const { overall, completed } = PROJECTS[0];

    return [
      {
        label: 'Projects',
        value: overall,
        secondaryValue: completed,
        color: this.primaryColor(),
        secondaryColor: this.secondaryColor(),
      },
    ];
  });

  readonly transactions = computed(() => TRANSACTIONS);
}