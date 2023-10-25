import { Component, OnInit, Output } from '@angular/core';
import { EventEmitter } from 'stream';

@Component({
  selector: 'app-accendent-model',
  templateUrl: './accendent-model.component.html',
  styleUrls: ['./accendent-model.component.scss']
})
export class AccendentModelComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  @Output() closeModal = new EventEmitter();


  closeModal1(data: any) {
    this.closeModal.emit(data);
  }

}
