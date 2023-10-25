import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoverageReceivedOrdersComponent } from './coverage-received-orders.component';

describe('CoverageReceivedOrdersComponent', () => {
  let component: CoverageReceivedOrdersComponent;
  let fixture: ComponentFixture<CoverageReceivedOrdersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoverageReceivedOrdersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoverageReceivedOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
