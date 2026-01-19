import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DragableTable } from './dragable-table-component';

describe('DragableTable', () => {
  let component: DragableTable;
  let fixture: ComponentFixture<DragableTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DragableTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DragableTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
