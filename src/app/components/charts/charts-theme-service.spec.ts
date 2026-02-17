import { TestBed } from '@angular/core/testing';

import { ChartsThemeService } from './charts-theme-service';

describe('ChartsThemeService', () => {
  let service: ChartsThemeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChartsThemeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
