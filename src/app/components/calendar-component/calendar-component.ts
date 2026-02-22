import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush, // <-- WICHTIG für Signal-Performance
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
  protected readonly locale = 'de';

  readonly view = signal<CalendarView>(CalendarView.Month);
  readonly viewDate = signal<Date>(new Date());
  readonly events = signal<CalendarEvent[]>([
    { start: new Date(), title: 'Test-Event' },
  ]);

  addEvent(date: Date): void {
    this.events.update(prev => [
      ...prev,
      { 
        title: 'Neues Event', 
        start: date, 
        allDay: true 
      }
    ]);
  }

  // Methode für explizite Updates des Datums (aus dem Template gerufen)
  updateDate(newDate: Date): void {
    this.viewDate.set(newDate);
  }
}