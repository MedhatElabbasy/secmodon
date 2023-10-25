import { TestBed } from '@angular/core/testing';

import { PackagesResolver } from './packages.resolver';

describe('PackagesResolver', () => {
  let resolver: PackagesResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(PackagesResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
