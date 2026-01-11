import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RingChartComponent } from './ring-chart-component';

describe('RingChartComponent', () => {
  let component: RingChartComponent;
  let fixture: ComponentFixture<RingChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RingChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RingChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
