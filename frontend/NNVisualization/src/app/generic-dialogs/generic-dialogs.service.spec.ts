import { TestBed, inject } from '@angular/core/testing';

import { GenericDialogsService } from './generic-dialogs.service';

describe('GenericDialogsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GenericDialogsService]
    });
  });

  it('should be created', inject([GenericDialogsService], (service: GenericDialogsService) => {
    expect(service).toBeTruthy();
  }));
});
