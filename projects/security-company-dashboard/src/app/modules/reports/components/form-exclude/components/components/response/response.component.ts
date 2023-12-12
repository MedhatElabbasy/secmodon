import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-response',
  templateUrl: './response.component.html',
  styleUrls: ['./response.component.scss']
})
export class ResponseComponent implements OnInit {

  checkboxForm: FormGroup;
  options = ['مناسب', 'غير مناسب' ];

  constructor(private fb: FormBuilder) {
    this.checkboxForm = this.fb.group({
      group: ['', Validators.required]
    });
  }
  ngOnInit(): void {
  }

}
