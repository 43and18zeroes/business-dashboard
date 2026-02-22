import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AppCalendarEvent } from '../models/calendar-event';

@Injectable({
  providedIn: 'root',
})
export class CalendarEventsService {
  private readonly _events$ = new BehaviorSubject<AppCalendarEvent[]>([
    { id: '1', title: 'Daily Standup', start: new Date() },
    { id: '2', title: 'Kundentermin', start: new Date(new Date().setHours(15, 0, 0, 0)) },
    { id: '3', title: 'Morgen-Event', start: new Date(Date.now() + 24 * 60 * 60 * 1000) },
  ]);

  events$ = this._events$.asObservable();

  setEvents(events: AppCalendarEvent[]) {
    this._events$.next(events);
  }
}