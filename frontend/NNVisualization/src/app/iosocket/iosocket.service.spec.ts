import { TestBed, inject } from '@angular/core/testing';

import { IOSocketService } from './iosocket.service';

describe('IOSocketService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [IOSocketService]
        });
    });

    it('should be created', inject([IOSocketService], (service: IOSocketService) => {
        expect(service).toBeTruthy();
    }));
});
