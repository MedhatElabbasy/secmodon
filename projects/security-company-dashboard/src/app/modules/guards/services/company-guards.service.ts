import { ApprovedStatus } from './../../../../../../tools/src/lib/enums/option-set.enum';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'projects/security-company-dashboard/src/environments/environment';
import { OptionSetEnum } from 'projects/tools/src/public-api';
import { AuthService } from '../../auth/services/auth.service';
import { ClientSite } from '../../client/models/client-site';
import {
  CompanySecurityGuard,
  SiteLocation,
} from '../../client/models/site-details';
import { GuardLeaves } from '../models/guard-leaves';
import { companyEquipment } from '../../settings/models/companyEquipment';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CompanyGuardsService {
  private readonly url = environment.api;
  id = new BehaviorSubject<any>(null);
  newGuard = new BehaviorSubject<any>(null);
  newSubervisor = new BehaviorSubject<any>(null);
  constructor(private http: HttpClient, private auth: AuthService) { }
  getAllGuardsOnCompany() {
    let companyId = this.auth.snapshot.userInfo?.id;
    return this.http.get<CompanySecurityGuard[]>(
      this.url +
      `api/GuardLocation/GetAllGuardOnCompanyById?companyId=${companyId}&IsSupervisor=false`
    );
  }
  getAllSupervisorsOnCompany() {
    let companyId = this.auth.snapshot.userInfo?.id;
    return this.http.get<CompanySecurityGuard[]>(
      this.url +
      `api/GuardLocation/GetAllGuardOnCompanyById?companyId=${companyId}&IsSupervisor=true`
    );
  }

  getAllGuardsOnBranch() {
    let companyId = this.auth.snapshot.userInfo?.id;
    let BranchId = this.auth.snapshot.userInfo?.securityCompanyBranch.id;
    return this.http.get<CompanySecurityGuard[]>(
      this.url +
      `api/GuardLocation/GetAllGuardOnCompanyByIdAndBranch?companyId=${companyId}&BranchId=${BranchId}&IsSupervisor=false`
    );
  }

  getAllSupervisorsOnBranch() {
    let companyId = this.auth.snapshot.userInfo?.id;
    let BranchId = this.auth.snapshot.userInfo?.securityCompanyBranch.id;
    return this.http.get<CompanySecurityGuard[]>(
      this.url +
      `api/GuardLocation/GetAllGuardOnCompanyByIdAndBranch?companyId=${companyId}&BranchId=${BranchId}&IsSupervisor=true`
    );
  }

  GetSchedulingByGuardId(guardId: string) {
    return this.http.get(
      this.url + `api/GuardSchedule/GetSchedulingByGuardId?GuardId=${guardId}`);
  }

  getGuardSites(id: string) {
    return this.http.get<SiteLocation[]>(
      this.url + `api/GuardLocation/GetAllLocationByGuardId?GuardId=${id}`
    );
  }

  getLeavesByCompanyGuardId(id: string) {
    return this.http.get<GuardLeaves[]>(
      this.url + `api/LeaveRequest/GetAllByDateGuardId?GuardId=${id}`
    );
  }

  getEquipmentsByCompanyGuardId(id: string) {
    return this.http.get<companyEquipment[]>(
      this.url +
      `api/GuardEquipment/GetAllBySecurityGuardId?SecurityGuardId=${id}`
    );
  }
  addEquipmentToUser(data: FormGroup) {
    return this.http.post(this.url + `api/GuardEquipment/Add`, data.value);
  }
  rejectRequest(id: string) {
    return this.http.post(
      this.url +
      `api/LeaveRequest/UpdateLeaveRequest?id=${id}&optionSetName=${OptionSetEnum.ApprovedStatus}&value=${ApprovedStatus.rejected}`,
      null
    );
  }

  acceptRequest(id: string) {
    return this.http.post(
      this.url +
      `api/LeaveRequest/UpdateLeaveRequest?id=${id}&optionSetName=${OptionSetEnum.ApprovedStatus}&value=${ApprovedStatus.approved}`,
      null
    );
  }
  uploadFile(attachmentId: number, companyId: number) {
    return this.http.get(
      this.url +
      `api/CompanySecurityGuard/UploadExelFileAndSendMessage?attachmentId=${attachmentId}&companyId=${companyId}`
    );
  }

  changeJobType(jobId: number, guardId: number) {
    return this.http.get(
      this.url + `api/SecurityGuard/ChangeType?id=${guardId}&type=${jobId}`
    );
  }

  deleteID(id: number) {
    return this.http.post(
      this.url + `api/SecurityGuard/DeleteDeviceId?id=${id}`,
      null
    );
  }
  getGuardByPhoneNumber(number: string) {
    return this.http.get(
      this.url + `api/SecurityGuard/GetByPhoneNumber?phoneNumber=${number}`
    );
  }
  getGuardByNationalId(NationalID: string) {
    return this.http.get(
      this.url + `api/SecurityGuard/GetByNationalID?NationalID=${NationalID}`
    );
  }

  assignGuardToBranch(guardForm:any): Observable<any>{
    return this.http.post(environment.api+`api/CompanySecurityGuard/UpdateBranch?id=${guardForm.id}&branchId=${guardForm.branchId}`, {})
  }
  deleteFromBranch(guardId:any): Observable<any>{
    return this.http.post(environment.api+`api/CompanySecurityGuard/RemoveBranch?id=${guardId}`, {})
  }


}
