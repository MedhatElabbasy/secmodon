import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewExcludeRequestComponent } from './view-exclude-request.component';

describe('ViewExcludeRequestComponent', () => {
  let component: ViewExcludeRequestComponent;
  let fixture: ComponentFixture<ViewExcludeRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewExcludeRequestComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewExcludeRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
