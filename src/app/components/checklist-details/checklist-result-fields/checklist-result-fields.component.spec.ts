import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChecklistResultFieldsComponent } from './checklist-result-fields.component';

describe('ChecklistResultFieldsComponent', () => {
  let component: ChecklistResultFieldsComponent;
  let fixture: ComponentFixture<ChecklistResultFieldsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChecklistResultFieldsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChecklistResultFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
