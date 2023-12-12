import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-accreditation',
  templateUrl: './accreditation.component.html',
  styleUrls: ['./accreditation.component.scss']
})
export class AccreditationComponent implements OnInit {

  checkboxForm: FormGroup;
  options = ['موافقة', 'عدم موافقة' ];

  constructor(private fb: FormBuilder) {
    this.checkboxForm = this.fb.group({
      group: ['', Validators.required]
    });
  }

  ngOnInit(): void {
  }

}
