import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  CalendarView,
  CalendarEvent,
  CalendarMonthViewComponent,
  CalendarWeekViewComponent,
  CalendarDayViewComponent,
  CalendarTodayDirective,
  CalendarNextViewDirective,
  CalendarPreviousViewDirective,
  CalendarDatePipe,
} from 'angular-calendar';

@Component({
  selector: 'app-calendar-component',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CalendarTodayDirective,
    CalendarNextViewDirective,
    CalendarPreviousViewDirective,
    CalendarDatePipe,
    CalendarMonthViewComponent,
    CalendarWeekViewComponent,
    CalendarDayViewComponent,
  ],
  templateUrl: './calendar-component.html',
  styleUrl: './calendar-component.scss',
})
export class CalendarComponent {
  protected readonly CalendarView = CalendarView;

  readonly locale = signal<'de' | 'en'>('de');

  readonly view = signal<CalendarView>(CalendarView.Month);
  readonly viewDate = signal(new Date());

  readonly events = signal<CalendarEvent[]>([
    { start: new Date(), title: 'Test-Event' },
  ]);

  readonly viewButtons = computed(() => ([
    { view: CalendarView.Month, label: 'Monat' },
    { view: CalendarView.Week, label: 'Woche' },
    { view: CalendarView.Day, label: 'Tag' },
  ]));

  readonly titleFormat = computed(() => {
    switch (this.view()) {
      case CalendarView.Month: return 'monthViewTitle';
      case CalendarView.Week: return 'weekViewTitle';
      case CalendarView.Day: return 'dayViewTitle';
      default: return 'monthViewTitle';
    }
  });

  addEvent(date: Date): void {
    this.events.update(prev => ([
      ...prev,
      { title: 'Neues Event', start: date, allDay: true },
    ]));
  }
}