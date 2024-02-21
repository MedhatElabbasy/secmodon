import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccreditationComponent } from './accreditation.component';

describe('AccreditationComponent', () => {
  let component: AccreditationComponent;
  let fixture: ComponentFixture<AccreditationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccreditationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccreditationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
