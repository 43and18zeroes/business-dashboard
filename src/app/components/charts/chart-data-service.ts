import { computed, inject, Injectable } from '@angular/core';
import { ChartData } from '../../models/chart.model';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { SALES_STATS } from './chart-data.constant';
import { of } from 'rxjs';

export interface RawChartEntry {
  category: string;
  sales: number;
  costs: number;
}

@Injectable({
  providedIn: 'root',
})
export class ChartDataService {
  private http = inject(HttpClient);
  private apiUrl = 'https://api.deine-seite.de/v1/data';

  private rawSalesData = toSignal(of(SALES_STATS as RawChartEntry[]), { 
  initialValue: SALES_STATS as RawChartEntry[] 
});

  readonly salesChartData = computed<ChartData[]>(() => {
    return this.rawSalesData().map((item) => ({
      label: item.category,
      value: item.sales,
      color: '#42A5F5',
    }));
  });
}
