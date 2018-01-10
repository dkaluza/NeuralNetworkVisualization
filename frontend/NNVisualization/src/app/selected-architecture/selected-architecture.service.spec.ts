import { TestBed, inject } from '@angular/core/testing';

import { SelectedArchitectureService } from './selected-architecture.service';

describe('SelectedArchitectureService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SelectedArchitectureService]
    });
  });

  it('should be created', inject([SelectedArchitectureService], (service: SelectedArchitectureService) => {
    expect(service).toBeTruthy();
  }));
});
