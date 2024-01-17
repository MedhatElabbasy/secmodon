import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivingDeliveringVehiclesComponent } from './receiving-delivering-vehicles.component';

describe('ReceivingDeliveringVehiclesComponent', () => {
  let component: ReceivingDeliveringVehiclesComponent;
  let fixture: ComponentFixture<ReceivingDeliveringVehiclesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReceivingDeliveringVehiclesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceivingDeliveringVehiclesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
