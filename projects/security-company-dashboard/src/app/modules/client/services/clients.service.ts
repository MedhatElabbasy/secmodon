import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'projects/security-company-dashboard/src/environments/environment';
import { Pagination } from 'projects/tools/src/public-api';
import { AuthService } from '../../auth/services/auth.service';
import { Client } from '../models/clients';
import { Observable } from 'rxjs';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class ClientsService {
  private readonly url = environment.api;
  constructor(private http: HttpClient, private auth: AuthService) { }

  getClientsBySecurityCompany(pageNumber: number, pageSize: number) {
    let companyID = this.auth.snapshot.userInfo?.id;
    return this.http.get<Pagination<Client>>(
      this.url +
      `api/SecurityCompanyClients/GetAllbySecurityCompanyid?companyID=${companyID}&page=${pageNumber}&pageSize=${pageSize}`
    );
  }



  getAllClientBranches(clientId: number) {
    return this.http.get(
      this.url + `api/ClientCompanyBranch/GetAllByCompanyId?id=${clientId}`
    );
  }
  getClientBranches(clientId: string) {
    return this.http.get(
      this.url + `api/ClientBranchConfig/GetAllBySecurityClientCompany?SecurityClientCompanyId=${clientId}`
    );
  }
  getClientsByBranchId(pageNumber: number, pageSize: number) {
    let id = this.auth.snapshot.userInfo?.securityCompanyBranch?.id;

    return this.http.get<Pagination<Client>>(
      this.url +
      `api/SecurityCompanyClients/GetAllByBranchId?BranchId=${id}&page=${pageNumber}&pageSize=${pageSize}`
    );
  }

  getClientDetailsById(id: string) {
    return this.http.get<Client>(
      this.url + `api/SecurityCompanyClients/GetById?Id=${id}`
    );
  }
  getALL(): Observable<any> {
    return this.http.get(
      this.url + `api/ClientCompany/GetAllClientCompany?page=1&pageSize=10000`
    );
  }
  createContract(data: FormGroup): Observable<any> {
    return this.http.post(
      this.url + `api/ClientSecurityContract/CreateOld`,
      data.value
    );
  }
  createClient(data: any): Observable<any> {
    return this.http.post(this.url + `api/SecurityCompanyClients/Create`, data);
  }
  getAllSchedule(id: string) {
    return this.http.get(this.url + `api/ClientSite/GetById?id=${id}`);
  }

  getSite(locationId: string) {
    return this.http.get(
      this.url + `api/ClientSite/GetClientSiteByLocationId?id=${locationId}`
    );
  }
  GetAllByLocationId(locationId: string) {
    return this.http.get(
      this.url + `api/GuardLocation/GetAllByLocationId?LocationId=${locationId}`
    );
  }
  getAllSupervisor(id: string) {
    return this.http.get(
      this.url + `api/ClientSite/GetAllSiteSupervisorShiftId?id=${id}`
    );
  }
  getSupervisorShifts(id: string) {
    let companyID = this.auth.snapshot.userInfo?.id;
    return this.http.get(
      this.url +
      `api/ClientSite/GetAllShiftBySupervisorId?SupervisorId=${id}&companyId=${companyID}`
    );
  }
  getScheduleByShiftId(shiftId: string, SupervisorShiftsId: string) {
    return this.http.get(
      this.url +
      `api/Scheduling/GetAllByClientShiftScheduleId?id=${SupervisorShiftsId}&SiteSupervisorShiftsId=${shiftId}`
    );
  }
  addToSchedule(data: any): Observable<any> {
    return this.http.post(this.url + `api/GuardSchedule/Add`, data);
  }
  updateBranch(data: any) {
    return this.http.get(
      this.url +
      `api/ClientCompanyBranch/UpdateBranch?clientbranchId=${data.clientbranchId}&SecurityBranchId=${data.SecurityBranchId}`,
      {}
    );
  }
  updateBranchData(data: any) {
    return this.http.post(this.url + `api/ClientBranchConfig/Update`, data);
  }
  addBranchData(data: any) {
    return this.http.post(this.url + `api/ClientBranchConfig/Add`, data);
  }
}
