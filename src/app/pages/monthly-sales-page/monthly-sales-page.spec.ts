import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlySalesPage } from './monthly-sales-page';

describe('MonthlySalesPage', () => {
  let component: MonthlySalesPage;
  let fixture: ComponentFixture<MonthlySalesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthlySalesPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthlySalesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
