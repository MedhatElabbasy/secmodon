import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllCoveragesComponent } from './all-coverages.component';

describe('AllCoveragesComponent', () => {
  let component: AllCoveragesComponent;
  let fixture: ComponentFixture<AllCoveragesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllCoveragesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllCoveragesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
