import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExcludeNewRequestComponent } from './exclude-new-request.component';

describe('ExcludeNewRequestComponent', () => {
  let component: ExcludeNewRequestComponent;
  let fixture: ComponentFixture<ExcludeNewRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExcludeNewRequestComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExcludeNewRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
