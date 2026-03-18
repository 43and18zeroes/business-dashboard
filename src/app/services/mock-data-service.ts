import { computed, Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ChartData } from '../models/chart.model';
import { ColorService } from './color-service';

type SeriesKey = 'primary' | 'secondary';
type SeriesSelectors<T> = Record<SeriesKey, (item: T) => number>;
type LabelSelector<T> = (item: T) => string;

interface SalesStat {
  category: string;
  sales: number;
  costs: number;
}

interface CustomerStat {
  category: string;
  currentYear: number;
  lastYear: number;
}

interface ProjectStat {
  overall: number;
  completed: number;
}

interface Transaction {
  txId: string;
  user: string;
  date: string;
  cost: number;
}

interface DashboardApiResponse {
  sales: SalesStat[];
  newCustomers: CustomerStat[];
  projects: ProjectStat[];
  transactions: Transaction[];
}

@Injectable({ providedIn: 'root' })
export class MockDataService {
  private readonly http = inject(HttpClient);
  private readonly colors = inject(ColorService);

  private readonly primaryColor = computed(() => this.colors.tokens().primary);
  private readonly secondaryColor = computed(() => this.colors.tokens().secondary);

  // Raw Signals
  private readonly _sales = signal<SalesStat[]>([]);
  private readonly _customers = signal<CustomerStat[]>([]);
  private readonly _projects = signal<ProjectStat[]>([]);
  private readonly _transactions = signal<Transaction[]>([]);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.loading.set(true);
    this.error.set(null);

    this.http
      .get<DashboardApiResponse>(`${environment.dataApiUrl}/dashboard.php`)
      .subscribe({
        next: (data) => {
          this._sales.set(data.sales);
          this._customers.set(data.newCustomers);
          this._projects.set(data.projects);
          this._transactions.set(data.transactions);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set('Daten konnten nicht geladen werden.');
          this.loading.set(false);
          console.error('[MockDataService] Status:', err.status);
          console.error('[MockDataService] Message:', err.message);
          console.error('[MockDataService] URL:', err.url);
        },
      });
  }

  private createChartData<T>(
    items: T[],
    selectors: SeriesSelectors<T>,
    labelSelector: LabelSelector<T>
  ): ChartData[] {
    const primary = this.primaryColor();
    const secondary = this.secondaryColor();

    return items.map((item) => ({
      label: labelSelector(item),
      value: selectors.primary(item),
      secondaryValue: selectors.secondary(item),
      color: primary,
      secondaryColor: secondary,
    }));
  }

  readonly salesChartData = computed<ChartData[]>(() =>
    this.createChartData(
      this._sales(),
      { primary: (x) => x.sales, secondary: (x) => x.costs },
      (x) => x.category
    )
  );

  readonly newCustomersChartData = computed<ChartData[]>(() =>
    this.createChartData(
      this._customers(),
      { primary: (x) => x.currentYear, secondary: (x) => x.lastYear },
      (x) => x.category
    )
  );

  readonly projectsChartData = computed<ChartData[]>(() => {
    const project = this._projects()[0];
    if (!project) return [];

    return [
      {
        label: 'Projects',
        value: project.overall,
        secondaryValue: project.completed,
        color: this.primaryColor(),
        secondaryColor: this.secondaryColor(),
      },
    ];
  });

  readonly transactions = computed(() => this._transactions());
}