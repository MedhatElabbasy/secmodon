import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AnyNaptrRecord } from 'dns';
import { SecurityCompany } from 'projects/tools/src/public-api';
import { AuthService } from '../../../auth/services/auth.service';
import { ShiftsService } from '../../services/shifts.service';

@Component({
  selector: 'app-timetrack',
  templateUrl: './timetrack.component.html',
  styleUrls: ['./timetrack.component.scss']
})
export class TimetrackComponent implements OnInit {
  minutes:number[]=[]
  lateminutes:number[]=[]
  earlyBreak!: any
  latLogOut!: any
  brack!: any
  attend!: any
  company!: SecurityCompany | null
  attendanceForm!: FormGroup
  earlyLoginchecked!: boolean
  lateLoginchecked!: boolean
  breakchecked!: boolean
  attendchecked!: boolean
  //negativeMinutes: number[] = [-5,-10,-15,-20,-25,-30,-35,-40,-45,-50,-55,-60];
  // attendboolean!:boolean
  // earlyBreakboolean!:boolean
  // latLogOutboolean!:boolean
  // brackboolean!:boolean
  constructor(private auth: AuthService, private fb: FormBuilder, private shift: ShiftsService) {
    for (let index = 1; index <= 12; index++) {
      let data = index * 5
      this.minutes.push(data)

    }

    for (let index = 1; index <= 36; index++) {
      let data = index * 5
      this.lateminutes.push(data)

    }

  //   for (let index = 1; index <= 12; index++) {
  //     // Calculate the data with negative values
  //     let data = index * -5;
  
  //     // Push the data to the array
  //    this.negativeMinutes.push(data);
  // }
    this.getInitData()
  }

  ngOnInit(): void {
  }

  getInitData() {
    this.auth.userInfo.subscribe((res) => {
      this.company = res;

      this.earlyBreak = this.company?.earlyLog;
      if (this.earlyBreak == 0) {
        this.earlyLoginchecked = false;
      } else {
        this.earlyLoginchecked = true;
      }

      this.latLogOut = this.company?.latLogOut;
      if (this.latLogOut == 0) {
        this.lateLoginchecked = false
      } else {
        this.lateLoginchecked = true
      }

      this.brack = this.company?.breakAutomaticClose;
      if (this.brack == 0) {
        this.breakchecked = false
      } else {
        this.breakchecked = true
      }

      this.attend = this.company?.attendanceAutomaticClose;
      if (this.attend == 0) {
        this.attendchecked = false;
      } else {
        this.attendchecked = true;
      }

    })
    this.generateAttendanceForm();
    this.patchValues();
  }

  generateAttendanceForm() {
    this.attendanceForm = this.fb.group({
      earlyBreak: [null, Validators.required],
      latLogOut: [null, Validators.required],
      brack: [null, Validators.required],
      attend: [null, Validators.required]
    })
  }

  get controls(): any {
    return this.attendanceForm.controls;
  }

  patchValues() {
    this.attendanceForm.controls['earlyBreak'].setValue(this.earlyBreak*-1)
    this.attendanceForm.controls['latLogOut'].setValue(this.latLogOut)
    this.attendanceForm.controls['brack'].setValue(this.brack)
    this.attendanceForm.controls['attend'].setValue(this.attend)
  }

  toggleState(event: any) {

    this.earlyLoginchecked = event.checked;
    if (this.earlyLoginchecked == false) {
      this.earlyBreak = 0;
      this.attendanceForm.controls['earlyBreak'].setValue(this.earlyBreak)
    }
  }

  latetoggle(event: any) {

    this.lateLoginchecked = event.checked
    if (this.lateLoginchecked == false) {
      this.latLogOut = 0;
      this.attendanceForm.controls['latLogOut'].setValue(this.latLogOut)
    }
  }

  breaktoggle(event: any) {
    this.breakchecked = event.checked
    if (this.breakchecked == false) {
      this.brack = 0;
      this.attendanceForm.controls['brack'].setValue(this.brack)
    }
  }

  attendtoggle(event: any) {
    this.attendchecked = event.checked
    if (this.attendchecked == false) {
      this.attend = 0;
      this.attendanceForm.controls['attend'].setValue(this.attend)
    }
  }

  saveChanges() {
    const latLogOutValue = this.attendanceForm.controls['latLogOut'].value;
    const negativeLatLogOutValue = -1 * latLogOutValue;
    const earlyLogValue= this.attendanceForm.controls['earlyBreak'].value;
    const negativeEarlyLogValue = -1 * earlyLogValue;
    this.shift.timetrack(this.company?.id, this.attendanceForm.controls['attend'].value, this.attendanceForm.controls['brack'].value, negativeLatLogOutValue, negativeEarlyLogValue).subscribe((res: any) => {

      this.auth.userInfo.next(res);
      this.auth.userInfo.subscribe((res) => {
        this.company = res!;
      });
    })
  }
}
