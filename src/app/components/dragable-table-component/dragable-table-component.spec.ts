import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DragableTableComponent2 } from './dragable-table-component-2';

describe('DragableTableComponent2', () => {
  let component: DragableTableComponent2;
  let fixture: ComponentFixture<DragableTableComponent2>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DragableTableComponent2]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DragableTableComponent2);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
