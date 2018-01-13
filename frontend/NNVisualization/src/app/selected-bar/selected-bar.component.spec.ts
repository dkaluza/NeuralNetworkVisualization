import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedBarComponent } from './selected-bar.component';

describe('SelectedBarComponent', () => {
  let component: SelectedBarComponent;
  let fixture: ComponentFixture<SelectedBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectedBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectedBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
