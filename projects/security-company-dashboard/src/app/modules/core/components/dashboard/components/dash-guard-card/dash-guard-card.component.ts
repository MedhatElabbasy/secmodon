import { Component, Input, OnInit } from '@angular/core';
import { AttendanceReport } from 'projects/security-company-dashboard/src/app/modules/reports/models/attendance-report';

@Component({
  selector: 'app-dash-guard-card',
  templateUrl: './dash-guard-card.component.html',
  styleUrls: ['./dash-guard-card.component.scss'],
})
export class DashGuardCardComponent implements OnInit {
  @Input('data') data!: any;
  @Input('time') time!: string;
  constructor() {}

  ngOnInit(): void {
    // console.log(this.data);
    // console.log(this.time);
    if(this.data.breakLoggers!=null){
      console.log(this.data.breakLoggers);
      this.time=this.data.breakLoggers.startTime;
      console.log(this.time);
    //   this.data.breakLogger.filter((ele)=>{
    //   ele.isActiveBreak==true
    //   this.time=ele.startTime
    //   console.log(this.time);

    // })
  }
  }
}
