import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AppCalendarEvent } from '../models/calendar-event';

@Injectable({
  providedIn: 'root',
})
export class CalendarEventsService {
  private readonly _events$ = new BehaviorSubject<AppCalendarEvent[]>(this.generateDemoEvents());

  events$ = this._events$.asObservable();

  private generateDemoEvents(): AppCalendarEvent[] {
    const events: AppCalendarEvent[] = [];
    const now = new Date();
    
    const startDay = -31; 
    const endDay = 31;

const titles = [
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
      'Design Critique'
    ];

    let idCounter = 1;

    for (let i = startDay; i <= endDay; i++) {
      const currentDate = new Date();
      currentDate.setDate(now.getDate() + i);
      const dayOfWeek = currentDate.getDay();

      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        
        events.push({
          id: (idCounter++).toString(),
          title: 'Daily Standup',
          start: new Date(new Date(currentDate).setHours(9, 15, 0, 0))
        });

        if (Math.random() > 0.3) {
          const randomHour = Math.floor(Math.random() * (16 - 10 + 1)) + 10;
          const randomTitle = titles[Math.floor(Math.random() * titles.length)];
          
          events.push({
            id: (idCounter++).toString(),
            title: randomTitle,
            start: new Date(new Date(currentDate).setHours(randomHour, 0, 0, 0))
          });
        }
      }
    }

    return events;
  }

  setEvents(events: AppCalendarEvent[]) {
    this._events$.next(events);
  }
}