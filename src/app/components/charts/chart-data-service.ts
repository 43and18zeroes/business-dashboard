import { computed, Injectable, signal } from '@angular/core';
import { ChartData } from '../../models/chart.model';

@Injectable({
  providedIn: 'root',
})
export class ChartDataService {
  private rawData = signal<any[]>([
    { category: 'January', sales: 420, costs: 310 },
    { category: 'February', sales: 380, costs: 290 },
    { category: 'March', sales: 510, costs: 350 },
    { category: 'April', sales: 490, costs: 340 },
    { category: 'May', sales: 580, costs: 400 },
    { category: 'June', sales: 620, costs: 420 },
    { category: 'July', sales: 550, costs: 410 },
    { category: 'August', sales: 530, costs: 390 },
    { category: 'September', sales: 690, costs: 480 },
    { category: 'October', sales: 720, costs: 510 },
    { category: 'November', sales: 850, costs: 580 },
    { category: 'December', sales: 980, costs: 650 },
  ]);

  readonly salesChartData = computed<ChartData[]>(() => {
    return this.rawData().map((item) => ({
      label: item.category,
      value: item.sales,
      color: '#42A5F5',
    }));
  });
}
