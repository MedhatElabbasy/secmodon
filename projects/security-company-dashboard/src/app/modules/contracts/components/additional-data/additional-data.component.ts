import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { CanvasService } from 'projects/tools/src/public-api';
import { ContractsService } from './../../services/contracts.service';
import { data } from './model/data';
import { ModalService } from './../../../../../../../tools/src/lib/services/modal.service';

@Component({
  selector: 'app-additional-data',
  templateUrl: './additional-data.component.html',
  styleUrls: ['./additional-data.component.scss']
})
export class AdditionalDataComponent implements OnInit {
  @ViewChild('form') form!: FormGroupDirective;
  isEdit!: boolean
  canvasId = 'add'
  modalId = 'delete'
  addData!: FormGroup;
  allData!: data[]
  selectedItem!: any
  deleteData!: data
  pattern1 = /^([a-zA-Z]+\s?){3,}$|^([\u0600-\u06FF]+\s?){3,}$/;
  pattern2 = /^([a-zA-Z]+\s?){20,}$|^([\u0600-\u06FF]+\s?){20,}$/;
  constructor(private contractService: ContractsService, private fb: FormBuilder, public canvas: CanvasService, private modal: ModalService) {
    this.generateForm()
  }

  ngOnInit(): void {
    this.getAll()
    this.contractService.inAdditional.next(true)
  }
  getAll() {
    this.contractService.getAllData().subscribe((res) => {
      this.allData = res
    })
  }
  generateForm() {
    this.addData = this.fb.group({
      itemNumberText: ['', [Validators.required, Validators.pattern(this.pattern1)]],
      itemName: ['', [Validators.required, Validators.pattern(this.pattern1)]],
      itemValue: ['', [Validators.required, Validators.pattern(this.pattern2)]]
    })
  }
  get controls(): any {
    return this.addData.controls;
  }
  add() {
    this.isEdit = false
    this.form.resetForm()
    this.canvas.open(this.canvasId)
  }
  edit() {
    this.isEdit = true
  }
  onSubmit() {
    if (this.addData.invalid) return
    if (!this.selectedItem) {
      this.contractService.addData(this.addData).subscribe((res: any) => {
        if (res.securityCompanyId) {
          this.canvas.close(this.canvasId)
          this.form.resetForm()
          this.getAll()
        }
      })
    } else {

    }
  }
  delete(data: data) {
    this.modal.open(this.modalId)
    this.deleteData = data
  }
  update(data: data) {
    this.selectedItem = data
    this.isEdit = true
    delete this.selectedItem.securityCompanyId
    this.addData.setValue(this.selectedItem)
    this.canvas.open(this.canvasId)
  }
  onDelete() {
    console.log(this.deleteData);
  }
}
