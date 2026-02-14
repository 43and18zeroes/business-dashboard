import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorldMapPage } from './world-map-page';

describe('WorldMapPage', () => {
  let component: WorldMapPage;
  let fixture: ComponentFixture<WorldMapPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorldMapPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorldMapPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
