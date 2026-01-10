import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewCustomersPage } from './new-customers-page';

describe('NewCustomersPage', () => {
  let component: NewCustomersPage;
  let fixture: ComponentFixture<NewCustomersPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewCustomersPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewCustomersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
