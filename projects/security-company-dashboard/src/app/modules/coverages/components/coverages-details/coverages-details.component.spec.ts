import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoveragesDetailsComponent } from './coverages-details.component';

describe('CoveragesDetailsComponent', () => {
  let component: CoveragesDetailsComponent;
  let fixture: ComponentFixture<CoveragesDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoveragesDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoveragesDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
