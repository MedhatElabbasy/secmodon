import { TestBed } from '@angular/core/testing';

import { PackagesGuard } from './packages.guard';

describe('PackagesGuard', () => {
  let guard: PackagesGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(PackagesGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
