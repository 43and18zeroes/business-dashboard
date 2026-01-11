import { computed, inject, Injectable } from '@angular/core';
import { ChartData } from '../../models/chart.model';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { NEW_CUSTOMERS_STATS, SALES_STATS } from './chart-data.constant';
import { of } from 'rxjs';

export interface RawSalesChartEntry {
  category: string;
  sales: number;
  costs: number;
}

export interface RawNewCustomersChartEntry {
  category: string;
  currentYear: number;
  lastYear: number;
}

const CHART_COLORS = {
  salesPrimary: '#007BFF',
  salesSecondary: '#00D4FF',
};

@Injectable({
  providedIn: 'root',
})
export class ChartDataService {
  private http = inject(HttpClient);
  private apiUrl = 'https://api.deine-seite.de/v1/data';

  private rawSalesData = toSignal(of(SALES_STATS as RawSalesChartEntry[]), {
    initialValue: SALES_STATS as RawSalesChartEntry[],
  });

  readonly salesChartData = computed<ChartData[]>(() => {
    return this.rawSalesData().map((item) => ({
      label: item.category,
      value: item.sales,
      secondaryValue: item.costs,
      color: CHART_COLORS.salesPrimary,
      secondaryColor: CHART_COLORS.salesSecondary,
    }));
  });

  private rawNewCustomersData = toSignal(of(NEW_CUSTOMERS_STATS as RawNewCustomersChartEntry[]), {
    initialValue: NEW_CUSTOMERS_STATS as RawNewCustomersChartEntry[],
  });

  readonly newCustomersChartData = computed<ChartData[]>(() => {
    return this.rawNewCustomersData().map((item) => ({
      label: item.category,
      value: item.currentYear,
      secondaryValue: item.lastYear,
      color: CHART_COLORS.salesPrimary,
      secondaryColor: CHART_COLORS.salesSecondary,
    }));
  });
}
