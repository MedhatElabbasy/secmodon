import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-employee-general-info',
  templateUrl: './employee-general-info.component.html',
  styleUrls: ['./employee-general-info.component.scss']
})
export class EmployeeGeneralInfoComponent implements OnInit {

  checkboxForm: FormGroup;
  options = ['مراقب أمن', 'مشرف عام', 'مشرف فترة' , 'مساعد مشرف فترة' , 'منسق إدارى'];

  constructor(private fb: FormBuilder) {
    this.checkboxForm = this.fb.group({
      group: ['', Validators.required]
    });
  }

  ngOnInit(): void {
  }

}
