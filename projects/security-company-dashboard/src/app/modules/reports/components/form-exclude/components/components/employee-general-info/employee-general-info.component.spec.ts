import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeGeneralInfoComponent } from './employee-general-info.component';

describe('EmployeeGeneralInfoComponent', () => {
  let component: EmployeeGeneralInfoComponent;
  let fixture: ComponentFixture<EmployeeGeneralInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeGeneralInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeGeneralInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
