import { computed, inject, Injectable, signal } from '@angular/core';
import { ChartData } from '../../models/chart.model';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { INITIAL_CHART_DATA } from './chart-data.constant';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChartDataService {
  private http = inject(HttpClient);
  private apiUrl = 'https://api.deine-seite.de/v1/sales';

  private rawData = toSignal(
    of(INITIAL_CHART_DATA),
    { initialValue: INITIAL_CHART_DATA }
  );

  readonly salesChartData = computed<ChartData[]>(() => {
    return this.rawData().map((item) => ({
      label: item.category,
      value: item.sales,
      color: '#42A5F5',
    }));
  });
}
