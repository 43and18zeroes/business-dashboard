import { Component } from '@angular/core';
import { CalendarComponent } from "../../components/calendar-component/calendar-component";

@Component({
  selector: 'app-calendar-page',
  imports: [CalendarComponent],
  templateUrl: './calendar-page.html',
  styleUrl: './calendar-page.scss',
})
export class CalendarPage {

}
