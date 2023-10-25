import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoverageGuardsComponent } from './coverage-guards.component';

describe('CoverageGuardsComponent', () => {
  let component: CoverageGuardsComponent;
  let fixture: ComponentFixture<CoverageGuardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoverageGuardsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoverageGuardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
