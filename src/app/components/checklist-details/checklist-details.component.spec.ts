import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChecklistDetailsComponent } from './checklist-details.component';

describe('ChecklistDetailsComponent', () => {
  let component: ChecklistDetailsComponent;
  let fixture: ComponentFixture<ChecklistDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChecklistDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChecklistDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
