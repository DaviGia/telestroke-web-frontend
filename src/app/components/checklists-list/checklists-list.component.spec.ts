import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChecklistsListComponent } from './checklists-list.component';

describe('ChecklistsListComponent', () => {
  let component: ChecklistsListComponent;
  let fixture: ComponentFixture<ChecklistsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChecklistsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChecklistsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
