import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbouttoexpireContractsComponent } from './abouttoexpire-contracts.component';

describe('AbouttoexpireContractsComponent', () => {
  let component: AbouttoexpireContractsComponent;
  let fixture: ComponentFixture<AbouttoexpireContractsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AbouttoexpireContractsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AbouttoexpireContractsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
