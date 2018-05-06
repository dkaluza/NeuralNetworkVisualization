import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainedModelsComponent } from './trained-models.component';

describe('TrainedModelsComponent', () => {
  let component: TrainedModelsComponent;
  let fixture: ComponentFixture<TrainedModelsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrainedModelsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainedModelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
