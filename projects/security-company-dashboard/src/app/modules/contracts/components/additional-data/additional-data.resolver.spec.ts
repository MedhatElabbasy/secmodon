import { TestBed } from '@angular/core/testing';

import { AdditionalDataResolver } from './additional-data.resolver';

describe('AdditionalDataResolver', () => {
  let resolver: AdditionalDataResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(AdditionalDataResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
