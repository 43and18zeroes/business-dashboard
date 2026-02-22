import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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
  imports: [
    CommonModule,

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
  CalendarView = CalendarView;

  view: CalendarView = CalendarView.Month;
  viewDate: Date = new Date();

  events: CalendarEvent[] = [
    { start: new Date(), title: 'Test-Event' },
  ];

  addEvent(date: Date) {
    this.events = [
      ...this.events,
      { title: 'Neues Event', start: date },
    ];
  }
}