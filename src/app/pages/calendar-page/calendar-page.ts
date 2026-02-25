import { Component } from '@angular/core';
import { CalendarComponent } from "../../components/calendar-component/calendar-component";
import { CalendarEventsService } from '../../services/calendar-events-service';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { AppCalendarEvent } from '../../models/calendar-event';

@Component({
  selector: 'app-calendar-page',
  imports: [CalendarComponent, AsyncPipe],
  templateUrl: './calendar-page.html',
  styleUrl: './calendar-page.scss',
})
export class CalendarPage {
  readonly events$: Observable<AppCalendarEvent[]>;

  constructor(private calendarEventsService: CalendarEventsService) {
    this.events$ = this.calendarEventsService.events$;
  }
}
