import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AppCalendarEvent } from '../models/calendar-event';

@Injectable({
  providedIn: 'root',
})
export class CalendarEventsService {
  private static readonly DEMO_RANGE_START_IN_DAYS = -31;
  private static readonly DEMO_RANGE_END_IN_DAYS = 31;
  private static readonly DAILY_STANDUP_HOUR = 9;
  private static readonly DAILY_STANDUP_MINUTE = 15;
  private static readonly RANDOM_EVENT_START_HOUR = 10;
  private static readonly RANDOM_EVENT_END_HOUR = 16;
  private static readonly RANDOM_EVENT_PROBABILITY = 0.7;
  private static readonly WEEKEND_DAYS = [0, 6];
  private static readonly DAILY_STANDUP_TITLE = 'Daily Standup';
  private static readonly RANDOM_EVENT_TITLES = [
    'Project Sync: Redesign',
    'Stakeholder Review',
    'Workshop: UX Strategy',
    '1:1 with Team Lead',
    'Sprint Planning',
    'Code Review & Refactoring',
    'Client Presentation',
    'Budget Planning Q3',
    'Product Backlog Refinement',
    'Technical Alignment',
    'Marketing Sync',
    'Design Critique',
  ];

  private readonly eventsSubject = new BehaviorSubject<AppCalendarEvent[]>(this.generateDemoEvents());

  readonly events$ = this.eventsSubject.asObservable();

  private nextEventId = 1;

  setEvents(events: AppCalendarEvent[]): void {
    this.eventsSubject.next(events);
  }

  private generateDemoEvents(): AppCalendarEvent[] {
    const generatedEvents: AppCalendarEvent[] = [];
    const today = new Date();

    for (
      let dayOffset = CalendarEventsService.DEMO_RANGE_START_IN_DAYS;
      dayOffset <= CalendarEventsService.DEMO_RANGE_END_IN_DAYS;
      dayOffset++
    ) {
      const date = this.createDateFromOffset(today, dayOffset);

      if (this.isWeekend(date)) {
        continue;
      }

      generatedEvents.push(this.createStandupEvent(date));

      if (!this.shouldCreateRandomEvent()) {
        continue;
      }

      generatedEvents.push(this.createRandomEvent(date));
    }

    return generatedEvents;
  }

  private createDateFromOffset(baseDate: Date, dayOffset: number): Date {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + dayOffset);
    return date;
  }

  private isWeekend(date: Date): boolean {
    return CalendarEventsService.WEEKEND_DAYS.includes(date.getDay());
  }

  private shouldCreateRandomEvent(): boolean {
    return Math.random() < CalendarEventsService.RANDOM_EVENT_PROBABILITY;
  }

  private createStandupEvent(date: Date): AppCalendarEvent {
    return this.createEvent(
      CalendarEventsService.DAILY_STANDUP_TITLE,
      this.createDateWithTime(
        date,
        CalendarEventsService.DAILY_STANDUP_HOUR,
        CalendarEventsService.DAILY_STANDUP_MINUTE
      )
    );
  }

  private createRandomEvent(date: Date): AppCalendarEvent {
    const randomTitle = this.pickRandomTitle();
    const randomHour = this.randomIntInRange(
      CalendarEventsService.RANDOM_EVENT_START_HOUR,
      CalendarEventsService.RANDOM_EVENT_END_HOUR
    );

    return this.createEvent(randomTitle, this.createDateWithTime(date, randomHour, 0));
  }

  private createEvent(title: string, start: Date): AppCalendarEvent {
    return {
      id: this.generateEventId(),
      title,
      start,
    };
  }

  private createDateWithTime(date: Date, hour: number, minute: number): Date {
    const dateWithTime = new Date(date);
    dateWithTime.setHours(hour, minute, 0, 0);
    return dateWithTime;
  }

  private pickRandomTitle(): string {
    const randomIndex = this.randomIntInRange(0, CalendarEventsService.RANDOM_EVENT_TITLES.length - 1);
    return CalendarEventsService.RANDOM_EVENT_TITLES[randomIndex];
  }

  private randomIntInRange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private generateEventId(): string {
    return (this.nextEventId++).toString();
  }
}