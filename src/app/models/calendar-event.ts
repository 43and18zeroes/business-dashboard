export interface AppCalendarEvent {
    id?: string;
    title: string;
    start: string | Date;
    end?: string | Date;
    allDay?: boolean;
    location?: string;
}