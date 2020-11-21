import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionPhaseComponent } from './session-phase.component';

describe('SessionPhaseComponent', () => {
  let component: SessionPhaseComponent;
  let fixture: ComponentFixture<SessionPhaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SessionPhaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SessionPhaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
