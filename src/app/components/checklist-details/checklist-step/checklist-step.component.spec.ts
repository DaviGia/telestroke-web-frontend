import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChecklistStepComponent } from './checklist-step.component';

describe('ChecklistStepComponent', () => {
  let component: ChecklistStepComponent;
  let fixture: ComponentFixture<ChecklistStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChecklistStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChecklistStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
