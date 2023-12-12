import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-transfer-reason',
  templateUrl: './transfer-reason.component.html',
  styleUrls: ['./transfer-reason.component.scss']
})
export class TransferReasonComponent implements OnInit {

  checkboxForm: FormGroup;
  options = ['غياب', 'حالة مخلة بالأنظمة', 'عدم تنفيذ التعليمات' , 'أخرى' ];

  constructor(private fb: FormBuilder) {
    this.checkboxForm = this.fb.group({
      group: ['', Validators.required]
    });
  }

  ngOnInit(): void {
  }

}
