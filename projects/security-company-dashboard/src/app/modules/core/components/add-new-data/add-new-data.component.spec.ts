import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewDataComponent } from './add-new-data.component';

describe('AddNewDataComponent', () => {
  let component: AddNewDataComponent;
  let fixture: ComponentFixture<AddNewDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddNewDataComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddNewDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
