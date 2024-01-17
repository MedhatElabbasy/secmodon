import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'projects/security-company-dashboard/src/environments/environment';
import { BehaviorSubject, map, Observable, observable } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';
import { Loader } from '../../core/enums/loader.enum';
import { AttendanceReport } from '../models/attendance-report';
import { Incident } from '../models/incident';
import { VisitorsReport } from '../models/visitors-report';
import { ClientSite } from '../../client/models/client-site';

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  private readonly url = environment.api;
  clientId = new BehaviorSubject<number>(0);
  statisticData = new BehaviorSubject<any>(null);
  incidentDetails: BehaviorSubject<any> = new BehaviorSubject({});
  dailyFactsDetails: BehaviorSubject<any> = new BehaviorSubject({});
  private formDataSubject = new BehaviorSubject<any[]>([]);
  formData$ = this.formDataSubject.asObservable();
  constructor(private http: HttpClient, private auth: AuthService) {}

  setFormData(data: any) {
    const currentData = this.formDataSubject.value;
    this.formDataSubject.next([...currentData, data]);
    console.log(this.formDataSubject.value);
  }
  submitAllForms(model:object) {
    return this.http.post(
      this.url + `api/TransferDetails/Add`,
    model
    );
  
  }

  attendanceReportForCompany(date: string, loader: Loader) {
    let companyId = this.auth.snapshot.userInfo?.id;
    return this.http.get<VisitorsReport[]>(
      this.url + `api/Visitor/GetAllByCompanyId?Id=${companyId}&date=${date}`,
      {
        headers: {
          loader: loader,
        },
      }
    );
  }

  attendanceReportForBranch(date: string, loader: Loader) {
    let branchId = this.auth.snapshot.userInfo?.securityCompanyBranch.id;
    return this.http.get<VisitorsReport[]>(
      this.url + `api/Visitor/GetAllByBranshId?Id=${branchId}&date=${date}`,
      {
        headers: {
          loader: loader,
        },
      }
    );
  }

  getAllAccidentByCompany(startDate: string, endDate: string, loader: Loader) {
    let companyId = this.auth.snapshot.userInfo?.id;
    return this.http
      .get<Incident[]>(
        this.url +
          `api/Incident/GetAllByCompanyIdAndDate?CompanyId=${companyId}&SatrtDate=${startDate}&EndDate=${endDate}`,
        {
          headers: {
            loader: loader,
          },
        }
      )
      .pipe(
        map((res) => {
          res = res.map((e) => {
            console.log(e);

            e.gallery = e.incidentAttachments.map((a) => a.attachment.fullLink);
            return e;
          });

          return res;
        })
      );
  }

  getAllIncidentByCompany(page: number, pageSize: number, loader: Loader) {
    let companyId = this.auth.snapshot.userInfo?.id;
    return this.http
      .get<any>(
        this.url +
          `api/IncidentReport/GetAllByCompanyId?CompanyId=${companyId}&page=${page}&pageSize=${pageSize}`,
        {
          headers: {
            loader: loader,
          },
        }
      )
      .pipe(
        map((res) => {
          console.log(res);

          res = res.data.map((e: any) => {
            e.gallery = [
              e.firstIncidentLocationImage,
              e.secondIncidentLocationImage,
            ].map((a: any) => a?.fullLink);
            return e;
          });

          return res;
        })
      );
  }

  getAllDailyFactByCompany(page: number, pageSize: number, loader: Loader) {
    console.log('Hi');

    let companyId = this.auth.snapshot.userInfo?.id;
    return this.http
      .get<any>(
        this.url +
          `api/DailyFactReport/GetAllByCompanyId?CompanyId=${companyId}&page=${page}&pageSize=${pageSize}`,
        {
          headers: {
            loader: loader,
          },
        }
      )
      .pipe(
        map((res) => {
          console.log(res);

          res = res.data.map((e: any) => {
            e.gallery = [
              e.firstIncidentLocationImage,
              e.secondIncidentLocationImage,
            ].map((a: any) => a?.fullLink);
            return e;
          });

          return res;
        })
      );
  }

  getAllAccidentByBranch(startDate: string, endDate: string, loader: Loader) {
    let companyId = this.auth.snapshot.userInfo?.id;
    let branchId = this.auth.snapshot.userInfo?.securityCompanyBranch.id;
    return this.http
      .get<Incident[]>(
        this.url +
          `api/Incident/GetAllByCompanyIdAndBranchAndDate?CompanyId=${companyId}&branchId=${branchId}&SatrtDate=${startDate}&EndDate=${endDate}`,
        {
          headers: {
            loader: loader,
          },
        }
      )
      .pipe(
        map((res) => {
          res = res.map((e) => {
            e.gallery = e.incidentAttachments.map((a) => a.attachment.fullLink);
            return e;
          });

          return res;
        })
      );
  }
  getAttendanceReport(startDate: string, endDate: string, loader: Loader) {
    let companyId = this.auth.snapshot.userInfo?.id;
    return this.http.get<AttendanceReport[]>(
      this.url +
        `api/Attendance/GetAllByCompanyAndDate?CompanyId=${companyId}&StartDate=${startDate}&EndDate=${endDate}`,
      {
        headers: {
          loader: loader,
        },
      }
    );
  }
  getAttendanceReportByBranch(
    startDate: string,
    endDate: string,
    loader: Loader
  ) {
    let branchId = this.auth.snapshot.userInfo?.securityCompanyBranch.id;
    let companyId = this.auth.snapshot.userInfo?.id;
    return this.http.get<AttendanceReport[]>(
      this.url +
        `api/Attendance/GetAllBySecurityCompanyIdAndDateAndBranchId?barachId=${branchId}&SecurityCompanyId=${companyId}&StartDate=${startDate}&EndDate=${endDate}`,
      {
        headers: {
          loader: loader,
        },
      }
    );
  }
  getAttendanceSuperVisorReport(
    startDate: string,
    endDate: string,
    loader: Loader
  ) {
    let companyId = this.auth.snapshot.userInfo?.id;
    return this.http.get<any[]>(
      this.url +
        `api/SupervisorAttendance/GetAllBetweenTwoDates?id=${companyId}&StartDate=${startDate}&EndDate=${endDate}`,
      {
        headers: {
          loader: loader,
        },
      }
    );
  }

  getAttendanceSuperVisorReportAndBranch(
    startDate: string,
    endDate: string,
    loader: Loader
  ) {
    let companyId = this.auth.snapshot.userInfo?.id;
    let branchId = this.auth.snapshot.userInfo?.securityCompanyBranch.id;
    return this.http.get<any[]>(
      this.url +
        `api/SupervisorAttendance/GetAllBetweenTwoDatesAndBranch?SecurityCompanyId=${companyId}&StartDate=${startDate}&EndDate=${endDate}&BranchId=${branchId}`,
      {
        headers: {
          loader: loader,
        },
      }
    );
  }
  getSuperVisorsAttendance(loader: Loader) {
    let companyId = this.auth.snapshot.userInfo?.id;
    return this.http.get<any[]>(
      this.url + `api/SupervisorAttendance/GetAllByCompanyId?id=${companyId}`,
      {
        headers: {
          loader: loader,
        },
      }
    );
  }
  getAttendanceReportByClient(
    startDate: string,
    endDate: string,
    ClientId: number,
    loader: Loader
  ) {
    let companyId = this.auth.snapshot.userInfo?.id;
    return this.http.get<AttendanceReport[]>(
      this.url +
        `api/Attendance/GetAllByCompanyAndClientIdAndDate?CompanyId=${companyId}&StartDate=${startDate}&EndDate=${endDate}&ClientId=${ClientId}`,
      {
        headers: {
          loader: loader,
        },
      }
    );
  }
  getAttendanceStatisitcReportByClient(
    startDate: string,
    endDate: string,
    ClientId: number,
    loader: Loader
  ) {
    let companyId = this.auth.snapshot.userInfo?.id;
    return this.http.get<AttendanceReport[]>(
      this.url +
        `api/Attendance/GetAttendanceStatsticByClientandLocation?CompanyId=${companyId}&StartDate=${startDate}&EndDate=${endDate}&ClientId=${ClientId}`,
      {
        headers: {
          loader: loader,
        },
      }
    );
  }

  getAttendanceStatisitcReportByClientAndBranch(
    startDate: string,
    endDate: string,
    ClientId: number,
    loader: Loader
  ) {
    let companyId = this.auth.snapshot.userInfo?.id;
    let branchId = this.auth.snapshot.userInfo?.securityCompanyBranch.id;
    return this.http.get<AttendanceReport[]>(
      this.url +
        `api/Attendance/GetAttendanceStatsticByClientandLocationAndBranchId?CompanyId=${companyId}&BranchId=${branchId}&StartDate=${startDate}&EndDate=${endDate}&ClientId=${ClientId}`,
      {
        headers: {
          loader: loader,
        },
      }
    );
  }
  getAttendanceStatisitcReport(
    startDate: string,
    endDate: string,
    loader: Loader
  ) {
    let companyId = this.auth.snapshot.userInfo?.id;
    return this.http.get(
      this.url +
        `api/Attendance/GetAttendanceStatsticByCompanyId?CompanyId=${companyId}&StartDate=${startDate}&EndDate=${endDate}`,
      {
        headers: {
          loader: loader,
        },
      }
    );
  }
  getAttendanceStatisitcReportByBranch(
    startDate: string,
    endDate: string,
    loader: Loader
  ) {
    let companyId = this.auth.snapshot.userInfo?.id;
    let branchId = this.auth.snapshot.userInfo?.securityCompanyBranch.id;
    return this.http.get(
      this.url +
        `api/Attendance/GetAttendanceStatsticByCompanyIdAndBranchId?CompanyId=${companyId}&branchId=${branchId}&StartDate=${startDate}&EndDate=${endDate}`,
      {
        headers: {
          loader: loader,
        },
      }
    );
  }
  getData(
    ClientId: number,
    firstDate: string,
    lastDate: string,
    loader: Loader
  ) {
    let companyId = this.auth.snapshot.userInfo?.id;
    return this.http.get(
      this.url +
        `api/Attendance/GetAttendanceStatsticByClientandLocationAndDay?CompanyId=${companyId}&StartDate=${firstDate}&EndDate=${lastDate}&clientId=${ClientId}`,
      {
        headers: {
          loader: loader,
        },
      }
    );
  }

  getDataByBranch(
    ClientId: number,
    firstDate: string,
    lastDate: string,
    loader: Loader
  ) {
    let companyId = this.auth.snapshot.userInfo?.id;
    let branchId = this.auth.snapshot.userInfo?.securityCompanyBranch.id;
    return this.http.get(
      this.url +
        `api/Attendance/GetAttendanceStatsticByClientandLocationAndBranchId?CompanyId=${companyId}&BranchId=${branchId}&StartDate=${firstDate}&EndDate=${lastDate}&clientId=${ClientId}`,
      {
        headers: {
          loader: loader,
        },
      }
    );
  }
  getALlData(firstDate: string, lastDate: string, loader: Loader) {
    let companyId = this.auth.snapshot.userInfo?.id;
    return this.http.get(
      this.url +
        `api/Attendance/GetAttendanceStatsticLocationAndDay?CompanyId=${companyId}&StartDate=${firstDate}&EndDate=${lastDate}`,
      {
        headers: {
          loader: loader,
        },
      }
    );
  }

  getALlDataByBranch(firstDate: string, lastDate: string, loader: Loader) {
    let companyId = this.auth.snapshot.userInfo?.id;
    let branchId = this.auth.snapshot.userInfo?.securityCompanyBranch.id;
    return this.http.get(
      this.url +
        `api/Attendance/GetAttendanceStatsticLocationAndDayAndBranchId?CompanyId=${companyId}&BranchId=${branchId}&StartDate=${firstDate}&EndDate=${lastDate}`,
      {
        headers: {
          loader: loader,
        },
      }
    );
  }

  getIncidentById(incidentId: string): Observable<any> {
    return this.http.get(
      environment.api + 'api/IncidentReport/GetById?Id=' + incidentId
    );
  }
  getDailyFactById(dailyFactId: string): Observable<any> {
    return this.http.get(
      environment.api + 'api/DailyFactReport/GetById?Id=' + dailyFactId
    );
  }

  convertImgToBase64(imgs: number[]): Observable<any> {
    return this.http.post(
      environment.api + 'api/Attachment/GetImageBase64',
      imgs
    );
  }

  getAllAttandanceByLocationId(
    startDate: string,
    endDate: string,
    locationId: string,
    securityCompanyClientId: string
  ): Observable<any> {
    let securityCompanyId = this.auth.snapshot.userInfo?.id;
    return this.http.get(
      environment.api +
        `api/Attendance/GetBySecurityCompanyIdDateLocationSecurityCompanyClientId?StartDate=${startDate}&EndDate=${endDate}&SecurityCompanyId=${securityCompanyId}&LocationId=${locationId}&SecurityCompanyClientId=${securityCompanyClientId}`
    );
  }

  
GetAllCompanySecurityGuardWithJop(){
  let securityCompanyId = this.auth.snapshot.userInfo?.id;
  return this.http.get(environment.api +`api/CompanySecurityGuard/GetAllCompanySecurityGuardWithJop?comapnyId=${securityCompanyId}`)
}

AllTransferBySecurityCompanyId(){
  let securityCompanyId = this.auth.snapshot.userInfo?.id;
  return this.http.get(environment.api +`api/TransferDetails/GetAllBySecurtityCompanyId?SecurtityCompanyId=${securityCompanyId}`)
}

getAllReceivingDeliveringVehicles(){
  let securityCompanyId = this.auth.snapshot.userInfo?.id;
  return this.http.get(environment.api +`api/ReceivingDeliveringVehicles/GetAllBySecurtityCompanyId?SecurtityCompanyId=${securityCompanyId}`)
}

updateTransferDetails(model:object){
  return this.http.post(environment.api+`api/TransferDetails/Update`,model)
}

getAllMissionsBysecurityCompanyId(){
    let companyId = this.auth.snapshot.userInfo?.id;
  return this.http.get<any[]>(
    this.url + `api/GuardTask/GetAllSecurityCompanyId?SecurityCompanyId=${companyId}`)
}

getAllToursBysecurityCompanyId(){
  let companyId = this.auth.snapshot.userInfo?.id;
  return this.http.get<any[]>(
    this.url + `api/GuardTour/GetBySecurityCompany?SecurityCompanyId=${companyId}`)
}

getTransferDetailsByID(Id:string){
return this.http.get(this.url +`api/TransferDetails/GetById?Id=${Id}`)
}
}
