import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InputsDialogComponent } from './inputs-dialog.component';

describe('InputsDialogComponent', () => {
  let component: InputsDialogComponent;
  let fixture: ComponentFixture<InputsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InputsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
