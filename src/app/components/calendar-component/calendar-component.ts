import { Component, HostListener, Input, SimpleChanges, ViewChild, OnInit } from '@angular/core';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, CalendarApi } from '@fullcalendar/core';

import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { AppCalendarEvent } from '../../models/calendar-event';

const MOBILE_BREAKPOINT_PX = 600;

@Component({
  selector: 'app-calendar-component',
  standalone: true,
  imports: [FullCalendarModule],
  templateUrl: './calendar-component.html',
})
export class CalendarComponent implements OnInit {
  @Input() events: AppCalendarEvent[] = [];
  @ViewChild('fullcalendar') fullcalendar?: FullCalendarComponent;

  public calendarOptions: CalendarOptions = this.getDefaultConfig();
  private isMobileView = false;

  ngOnInit(): void {
    this.checkScreenSize(window.innerWidth);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['events'] && this.events) {
      this.updateCalendarEvents();
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize(window.innerWidth);
  }

  private checkScreenSize(width: number): void {
    const isMobile = width <= MOBILE_BREAKPOINT_PX;
    
    if (isMobile === this.isMobileView) return;

    this.isMobileView = isMobile;
    this.applyResponsiveLayout();
  }

  private applyResponsiveLayout(): void {
    const calendarApi = this.getApi();
    if (!calendarApi) return;
    const newView = this.isMobileView ? 'listWeek' : 'dayGridMonth';
    calendarApi.changeView(newView);
    this.calendarOptions = {
      ...this.calendarOptions,
      headerToolbar: this.getToolbarConfig()
    };
  }

  private updateCalendarEvents(): void {
    this.calendarOptions = {
      ...this.calendarOptions,
      events: [...this.events]
    };
  }

  private getDefaultConfig(): CalendarOptions {
    return {
      plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
      initialView: window.innerWidth <= MOBILE_BREAKPOINT_PX ? 'listWeek' : 'dayGridMonth',
      headerToolbar: this.getToolbarConfig(),
      editable: true,
      selectable: true,
      handleWindowResize: true,
      height: '100%',
    };
  }

  private getToolbarConfig() {
    return this.isMobileView
      ? { left: 'prev,next', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek' }
      : { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek' };
  }

  private getApi(): CalendarApi | null {
    return this.fullcalendar ? this.fullcalendar.getApi() : null;
  }
}