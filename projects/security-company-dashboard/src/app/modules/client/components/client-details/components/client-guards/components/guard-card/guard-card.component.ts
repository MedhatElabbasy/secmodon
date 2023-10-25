import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GuardLocation } from 'projects/security-company-dashboard/src/app/modules/client/models/guard-location';
import { ClientSiteService } from 'projects/security-company-dashboard/src/app/modules/client/services/client-site.service';
import { ClientsService } from 'projects/security-company-dashboard/src/app/modules/client/services/clients.service';

import {
  CanvasService,
  LangService,
  language,
  ModalService,
} from 'projects/tools/src/public-api';

@Component({
  selector: 'app-guard-card',
  templateUrl: './guard-card.component.html',
  styleUrls: ['./guard-card.component.scss'],
})
export class GuardCardComponent implements OnInit {
  @Input('guard') guard!: GuardLocation;
  @Output('update') update = new EventEmitter();
  deleteCanvas = 'delete-canvas';
  allShifts = 'allShifts';
  successAlert = 'successAlert';
  allSchedules = 'allSchedules';
  locationId!: string;
  locationName!: string
  siteName!: string;
  siteId!: string;
  superVisorId!: string;
  superVisorId2!: any;
  guardData!: any;
  selectedItem!: any;
  uniqueArray!: any;
  uniqueArray2!: any;

  guardId: any;
  allSuperVisors: any[] = [];
  schedules: any[] = [];
  shifts: any[] = [];
  isAr = true;
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
    public modal: ModalService,
    public canvas: CanvasService,
    public Router: ActivatedRoute,
    public clientServices: ClientsService,
    private siteService: ClientSiteService,
    private lang: LangService
  ) {
    this.lang.language.subscribe((res) => {
      this.isAr = res == language.ar ? true : false;
    });
  }

  ngOnInit(): void {
    this.deleteCanvas = this.deleteCanvas + '-' + crypto.randomUUID();
    // console.log(this.guard);


  }
  getData() {
    this.allSuperVisors = [];
    this.Router.params.subscribe((res) => {
      this.locationId = res['locationId'];
      this.clientServices.getSite(this.locationId).subscribe((res: any) => {
        this.siteId = res.id;
        this.siteName = res.siteName;

        if (res) {
          this.clientServices
            .getAllSupervisor(res.id)
            .subscribe((res2: any) => {
              let data: any[] = []
              if (res2) {
                res2.forEach((element: any) => {
                  element.companySecurityGuard.securityGuard.name =
                    element.companySecurityGuard.securityGuard.firstName +
                    ' ' +
                    element.companySecurityGuard.securityGuard.lastName;
                  element.companySecurityGuard.securityGuard.superVisorId =
                    element.companySecurityGuard.id;
                  element.companySecurityGuard.securityGuard.superVisorId2 =
                    element.id;

                  data.push(
                    element.companySecurityGuard.securityGuard
                  );
                });

                if (data.length) {
                  this.uniqueArray2 = data.filter(
                    (obj: any, index: any, self: any) =>
                      index === self.findIndex((o: any) => o.id === obj.id)
                  );
                }
                this.allSuperVisors = data;

              }
            });
        }
      });
      if (!this.locationName) {
        this.clientServices.GetAllByLocationId(this.locationId).subscribe((res: any) => {

          this.locationName = res[0].siteLocation?.name

        })
      }

    });
  }
  delete() {
    this.siteService.deleteGuardFromLocation(this.guard.id).subscribe((res) => {
      this.modal.close(this.deleteCanvas);
      this.update.emit();
    });
  }
  allShiftsCanvas(data: any) {
    this.getData()
    this.selectedItem = null;
    this.superVisorId = '';
    this.canvas.open(this.allShifts);
    let item = data.companySecurityGuardId;
    this.guardId = item
    localStorage.setItem("guardId", this.guardId)
  }
  selectSuperVisor() {
    this.superVisorId = this.selectedItem.superVisorId;
    this.allSuperVisors.forEach((element) => {
      if (element.superVisorId == this.superVisorId) {
        this.superVisorId2 = element;
      }
    });

    this.clientServices
      .getSupervisorShifts(this.superVisorId)
      .subscribe((res: any) => {
        let data: any[] = [];
        this.shifts = res;
        this.shifts.forEach((element) => {
          element.clientShiftSchedule.companyShift.shiftType.siteSuperVisorId =
            element.id;
          element.clientShiftSchedule.companyShift.shiftType.shiftStartTime =
            element.clientShiftSchedule.shiftStartTime;
          element.clientShiftSchedule.companyShift.shiftType.shiftEndTime =
            element.clientShiftSchedule.shiftEndTime;
          element.clientShiftSchedule.companyShift.shiftType.shiftId =
            element.clientShiftSchedule.companyShift.id;
          element.clientShiftSchedule.companyShift.shiftType.clientShiftSchedule =
            element.clientShiftSchedule.id;
          data.push(element.clientShiftSchedule.companyShift.shiftType);
        });
        if (data.length) {
          this.uniqueArray = data.filter(
            (obj: any, index: any, self: any) =>
              index === self.findIndex((o: any) => o.id === obj.id)
          );
        }
      });
  }


  selectShift(data: any) {

    this.canvas.open(this.allSchedules);
    let clientShiftScheduleId = data.clientShiftSchedule;
    let shiftId = data.shiftId;
    this.clientServices
      .getScheduleByShiftId(shiftId, clientShiftScheduleId)
      .subscribe((res: any) => {
        this.schedules = res;
        console.log(this.schedules);
      });
  }
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
  addToSchedule(data: any) {

    let scheduleId = data.id;
    let object = {
      schedulingId: scheduleId,
      siteSupervisorShiftId: this.superVisorId2.superVisorId2,
      companySecurityGuardId: localStorage.getItem("guardId"),
    };
    console.log(data);
    console.log(object);


    this.clientServices.addToSchedule(object).subscribe((res) => {
      if (res.id) {
        this.canvas.close(this.allSchedules);
        this.modal.open(this.successAlert);
        localStorage.removeItem("guardId")
      }
    });
  }
}
