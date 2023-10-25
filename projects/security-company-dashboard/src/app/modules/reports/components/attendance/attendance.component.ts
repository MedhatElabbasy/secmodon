
import { Component, OnInit } from '@angular/core';
import { TypesList } from '../../routes/reports-routes.enum';
@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss'],
})
export class AttendanceComponent {


  constructor() {

  }


  links = [...TypesList];
}
