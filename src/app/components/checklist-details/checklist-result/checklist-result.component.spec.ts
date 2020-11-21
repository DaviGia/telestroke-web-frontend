import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChecklistResultComponent } from './checklist-result.component';

describe('ChecklistResultComponent', () => {
  let component: ChecklistResultComponent;
  let fixture: ComponentFixture<ChecklistResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChecklistResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChecklistResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
