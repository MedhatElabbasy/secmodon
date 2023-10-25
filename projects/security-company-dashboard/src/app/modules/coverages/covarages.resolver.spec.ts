import { TestBed } from '@angular/core/testing';

import { CovaragesResolver } from './covarages.resolver';

describe('CovaragesResolver', () => {
  let resolver: CovaragesResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(CovaragesResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
