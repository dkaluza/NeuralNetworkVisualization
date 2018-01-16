import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VisArchComponent } from './vis-arch.component';

describe('VisArchComponent', () => {
  let component: VisArchComponent;
  let fixture: ComponentFixture<VisArchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VisArchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VisArchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
