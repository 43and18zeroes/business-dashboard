import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorldMapComponent2 } from './world-map-component-2';

describe('WorldMapComponent2', () => {
  let component: WorldMapComponent2;
  let fixture: ComponentFixture<WorldMapComponent2>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorldMapComponent2]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorldMapComponent2);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
