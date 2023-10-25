import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectBranchesComponent } from './connect-branches.component';

describe('ConnectBranchesComponent', () => {
  let component: ConnectBranchesComponent;
  let fixture: ComponentFixture<ConnectBranchesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConnectBranchesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConnectBranchesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
