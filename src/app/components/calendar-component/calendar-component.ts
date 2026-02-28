import { Component, HostListener, Input, SimpleChanges } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';

import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { AppCalendarEvent } from '../../models/calendar-event';

@Component({
  selector: 'app-calendar-component',
  standalone: true,
  imports: [FullCalendarModule],
  templateUrl: './calendar-component.html',
  styleUrl: './calendar-component.scss',
})
export class CalendarComponent {
  @Input() events: AppCalendarEvent[] = [];

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
    initialView: this.getInitialView(),
    headerToolbar: this.getHeaderToolbar(),
    editable: true,
    selectable: true,
    events: [],
    handleWindowResize: true,
    height: 'auto',
  };

  private getInitialView() {
    return window.innerWidth <= 600 ? 'listWeek' : 'dayGridMonth';
  }

  private getHeaderToolbar() {
    if (window.innerWidth <= 600) {
      return {
        left: 'prev,next',
        center: 'title',
        right: 'listWeek,timeGridDay'
      };
    }
    return {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    };
  }

  @HostListener('window:resize')
  onResize() {
    this.updateCalendarOptions();
  }

  private updateCalendarOptions() {
    const isMobile = window.innerWidth <= 600;

    this.calendarOptions = {
      ...this.calendarOptions,
      initialView: isMobile ? 'listWeek' : 'dayGridMonth',
      headerToolbar: isMobile
        ? { left: 'prev,next', center: 'title', right: 'listWeek,timeGridDay' }
        : { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek' },
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['events']) {
      this.calendarOptions = {
        ...this.calendarOptions,
        events: this.events.map(e => ({
          id: e.id,
          title: e.title,
          start: e.start,
          end: e.end,
          allDay: e.allDay,
        })),
      };
    }
  }
}