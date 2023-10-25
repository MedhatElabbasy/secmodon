import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuardBranchComponent } from './guard-branch.component';

describe('GuardBranchComponent', () => {
  let component: GuardBranchComponent;
  let fixture: ComponentFixture<GuardBranchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GuardBranchComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuardBranchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
