import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsTickerWidget } from './news-ticker-widget';

describe('NewsTickerWidget', () => {
  let component: NewsTickerWidget;
  let fixture: ComponentFixture<NewsTickerWidget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsTickerWidget]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewsTickerWidget);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
