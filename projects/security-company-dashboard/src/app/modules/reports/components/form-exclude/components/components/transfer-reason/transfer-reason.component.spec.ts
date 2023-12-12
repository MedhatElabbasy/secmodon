import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferReasonComponent } from './transfer-reason.component';

describe('TransferReasonComponent', () => {
  let component: TransferReasonComponent;
  let fixture: ComponentFixture<TransferReasonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransferReasonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransferReasonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
