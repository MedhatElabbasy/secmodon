import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackageSubscribeComponent } from './package-subscribe.component';

describe('PackageSubscribeComponent', () => {
  let component: PackageSubscribeComponent;
  let fixture: ComponentFixture<PackageSubscribeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PackageSubscribeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PackageSubscribeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
