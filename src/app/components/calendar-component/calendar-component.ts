import { Component, signal, computed } from '@angular/core';
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
  imports: [
    // Nur die spezifischen Kalender-Module, kein CommonModule nötig
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
  // Wir machen den Enum im Template verfügbar
  protected readonly CalendarView = CalendarView;

  // State-Management via Signals
  readonly view = signal<CalendarView>(CalendarView.Month);
  readonly viewDate = signal<Date>(new Date());
  readonly events = signal<CalendarEvent[]>([
    { start: new Date(), title: 'Test-Event' },
  ]);

  // Beispiel für ein Computed Signal (falls du Logik basierend auf dem Datum brauchst)
  // Das CalendarDatePipe im Template ist aber meistens ausreichend.

  addEvent(date: Date): void {
    this.events.update(prev => [
      ...prev,
      { title: 'Neues Event', start: date }
    ]);
  }

  setView(view: CalendarView): void {
    this.view.set(view);
  }
}