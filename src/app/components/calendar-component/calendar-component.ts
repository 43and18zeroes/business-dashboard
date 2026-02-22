import { Component } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';

import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';

@Component({
  selector: 'app-calendar-component',
  standalone: true,
  imports: [FullCalendarModule],
  templateUrl: './calendar-component.html',
  styleUrl: './calendar-component.scss',
})
export class CalendarComponent {
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
    },

    selectable: true,
    editable: true,

    dateClick: (info) => {
      console.log('dateClick', info.dateStr);
    },
    eventClick: (info) => {
      console.log('eventClick', info.event.title);
    },

    events: [
      { title: 'Termin', start: new Date().toISOString().slice(0, 10) },
      { title: 'Meeting', start: new Date(Date.now() + 86400000).toISOString().slice(0, 10) },
    ],
  };
}
