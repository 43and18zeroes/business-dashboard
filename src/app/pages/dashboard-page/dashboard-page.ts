import { Component, inject } from '@angular/core';
import { BarChartComponent } from '../../components/charts/bar-chart-component/bar-chart-component';
import { MockDataService } from '../../services/mock-data-service';
import { LineChartComponent } from "../../components/charts/line-chart-component/line-chart-component";
import { RingChartComponent } from "../../components/charts/ring-chart-component/ring-chart-component";
import { DragableTableComponent, ReorderEvent } from "../../components/dragable-table-component/dragable-table-component";
import { TRANSACTIONS } from '../../services/mock-data.constant';
import { TRANSACTION_TABLE_UTILS } from '../../shared/table-utils';
import { WorldMapComponent } from "../../components/charts/world-map-component/world-map-component";
import { CalendarEventsService } from '../../services/calendar-events-service';
import { TodayEventsWidget } from "../../components/calendar-component/today-events-widget/today-events-widget";
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { AppCalendarEvent } from '../../models/calendar-event';
import { NewsTickerWidget } from "../../components/news-ticker-widget/news-ticker-widget";
import { WeatherWidget } from "../../components/weather-widget/weather-widget";
import { DeviceService } from '../../services/device-service';

type Transaction = (typeof TRANSACTIONS)[number];

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    BarChartComponent,
    LineChartComponent,
    RingChartComponent,
    DragableTableComponent,
    WorldMapComponent,
    TodayEventsWidget,
    AsyncPipe,
    NewsTickerWidget,
    WeatherWidget
  ],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPage {
  protected chartService = inject(MockDataService);
  private deviceService = inject(DeviceService);
  private calendarEventsService = inject(CalendarEventsService);

  isMobile = this.deviceService.isMobile;
  readonly events$: Observable<AppCalendarEvent[]> = this.calendarEventsService.events$;

  transactionColumns = ['txId', 'cost'] as const;
  cellFormatter = TRANSACTION_TABLE_UTILS.cellFormatter;

  onTransactionsReorder(ev: ReorderEvent<Transaction>) {
    TRANSACTION_TABLE_UTILS.persistOrder(ev);
  }
}