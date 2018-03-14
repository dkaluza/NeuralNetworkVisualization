import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeoutAlertComponent } from './timeout-alert.component';

describe('TimeoutAlertComponent', () => {
    let component: TimeoutAlertComponent;
    let fixture: ComponentFixture<TimeoutAlertComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TimeoutAlertComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TimeoutAlertComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
