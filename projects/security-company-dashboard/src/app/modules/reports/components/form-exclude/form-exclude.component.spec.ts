import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormExcludeComponent } from './form-exclude.component';

describe('FormExcludeComponent', () => {
  let component: FormExcludeComponent;
  let fixture: ComponentFixture<FormExcludeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormExcludeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormExcludeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
