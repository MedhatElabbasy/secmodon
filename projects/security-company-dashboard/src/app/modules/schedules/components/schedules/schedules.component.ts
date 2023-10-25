import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import {
  CanvasService,
  LangService,
  ModalService,
} from 'projects/tools/src/public-api';
import { ClientShift } from '../../models/client-shift';
import { Schedule } from '../../models/schedule';
import { SchedulesService } from '../../services/schedules.service';

@Component({
  selector: 'app-schedules',
  templateUrl: './schedules.component.html',
  styleUrls: ['./schedules.component.scss'],
})
export class SchedulesComponent implements OnInit {
  @Input('schedule') schedule!: Schedule;
  @Input('shift') shift!: ClientShift;
  @Output('edit') edit = new EventEmitter();
  @Output('delete') delete = new EventEmitter();
  @Output('copy') copy = new EventEmitter();
  @Output('getUpdateMode') getUpdateMode = new EventEmitter();
  @Input() getClientShifts:any

  readonly id!: string;
  copyMode: boolean = false


  week = [
    'isSaturday',
    'isSunday',
    'isMonday',
    'isTuesday',
    'isWednesday',
    'isThursday',
    'isFriday',
  ];

  constructor(
    public lang: LangService,
    public canvas: CanvasService,
    public modal: ModalService,
    private scheduleService: SchedulesService
  ) {
    this.id = 'schedule' + crypto.randomUUID();
  }

  sendUpdateMode(value:boolean){
    this.getUpdateMode.emit(value)
  }

  ngOnInit(): void { }

  getScheduleDay(_schedule: any) {
    let days = 0;
    for (const key in _schedule) {
      if (this.week.includes(key)) {
        if (_schedule[key]) {
          days++;
        }
      }
    }

    return days;
  }

  extractDays(_schedule: any): { name: string; value: boolean }[] {
    let days: any = [];
    this.week.forEach((e) => {
      _schedule[e];

      let obj = { name: e, value: _schedule[e] };
      days.push(obj);
    });

    return days;
  }

  onEdit() {
    this.edit.emit(this.schedule);
    // this.copy.emit(this.schedule);

  }

  onDelete() {
    this.scheduleService.schedule.subscribe((res: any) => {
      if (res.id) {
        this.delete.emit(res);
        this.modal.close('modal');
      }
    });
  }
  openDelete(data: any) {
    this.scheduleService.schedule.next(data);
    this.modal.open('modal');
  }




  onCopy() {
    // console.log(this.schedule);
    this.copy.emit(this.schedule);


    // this.scheduleService.copySchedule(this.schedule).subscribe((res) => {
    //   console.log(res);
    // })
  }


  copyNow() {
    this.scheduleService.copySchedule(this.schedule).subscribe((res) => {
      console.log(res);
      this.canvas.close(this.id)
      this.scheduleService.getAllShifts(localStorage.getItem("clientId") || "").subscribe((shifts) => {
        this.scheduleService.shiftsBehaviorSubject.next(shifts)

      })
    })
  }
}
