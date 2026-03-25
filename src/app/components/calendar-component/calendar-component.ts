import { Component, HostListener, Input, SimpleChanges, ViewChild } from '@angular/core';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
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
})
export class CalendarComponent {
  @Input() events: AppCalendarEvent[] = [];

  @ViewChild('fullcalendar') fullcalendar!: FullCalendarComponent;

  private isMobileView = window.innerWidth <= 600;

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
    initialView: this.getInitialView(),
    headerToolbar: this.getHeaderToolbar(this.isMobileView),
    editable: true,
    selectable: true,
    events: [],
    handleWindowResize: true,
    height: '100%',
  };

  ngAfterViewInit() {
    this.updateLayout(window.innerWidth);
  }

  private getInitialView() {
    return window.innerWidth <= 600 ? 'listWeek' : 'dayGridMonth';
  }

  private getHeaderToolbar(isMobile: boolean) {
    return isMobile
      ? { left: 'prev,next', center: 'title', right: 'listWeek,timeGridDay' }
      : { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek' };
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.updateLayout(event.target.innerWidth);
  }

  private updateLayout(width: number) {
    const shouldBeMobile = width <= 600;

    if (shouldBeMobile !== this.isMobileView) {
      this.isMobileView = shouldBeMobile;

      const calendarApi = this.fullcalendar.getApi();
      const newView = shouldBeMobile ? 'listWeek' : 'dayGridMonth';

      calendarApi.changeView(newView);

      this.calendarOptions = {
        ...this.calendarOptions,
        headerToolbar: this.getHeaderToolbar(shouldBeMobile)
      };
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['events'] && this.events) {
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