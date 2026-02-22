import { Component, Input } from '@angular/core';
import { AppCalendarEvent } from '../../../models/calendar-event';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-today-events-widget',
  imports: [CommonModule],
  templateUrl: './today-events-widget.html',
  styleUrl: './today-events-widget.scss',
})
export class TodayEventsWidget {
  @Input() events: AppCalendarEvent[] = [];

  get todayEvents(): AppCalendarEvent[] {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    return this.events
      .filter(e => {
        const start = new Date(e.start);
        return start >= startOfDay && start <= endOfDay;
      })
      .sort((a, b) => +new Date(a.start) - +new Date(b.start));
  }

  formatTime(d: string | Date): string {
    const date = new Date(d);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}