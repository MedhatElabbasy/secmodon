import { TestBed } from '@angular/core/testing';

import { UpdateDataGuard } from './update-data.guard';

describe('UpdateDataGuard', () => {
  let guard: UpdateDataGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(UpdateDataGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
