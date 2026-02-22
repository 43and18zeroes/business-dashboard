import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodayEventsWidget } from './today-events-widget';

describe('TodayEventsWidget', () => {
  let component: TodayEventsWidget;
  let fixture: ComponentFixture<TodayEventsWidget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodayEventsWidget]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TodayEventsWidget);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
