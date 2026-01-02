import { computed, Injectable, signal } from '@angular/core';
import { ChartData } from '../models/chart.model';

@Injectable({
  providedIn: 'root',
})
export class ChartDataService {
  private rawData = signal<any[]>([
    { category: 'January', sales: 450, costs: 200 },
    { category: 'February', sales: 600, costs: 350 },
  ]);

  readonly salesChartData = computed<ChartData[]>(() => {
    return this.rawData().map((item) => ({
      label: item.category,
      value: item.sales,
      color: '#42A5F5',
    }));
  });
}
