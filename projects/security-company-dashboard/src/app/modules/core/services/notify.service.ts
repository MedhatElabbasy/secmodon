import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'projects/security-company-dashboard/src/environments/environment';
import { Loader } from '../enums/loader.enum';

@Injectable({
  providedIn: 'root',
})
export class NotifyService {
  private readonly url = environment.api;
  constructor(private http: HttpClient) { }

  companyNotification(CompanyId: number, pageNumber: number, pageSize: number) {
    return this.http.get(
      this.url +
      `api/Notification/GetAllForSecurityCompany?securityCompanyId=${CompanyId}&page=${pageNumber}&pageSize=${pageSize}`,
      {
        headers: {
          loader: 'true',
        },
      }
    );
  }

  companyBranchNotification(
    CompanyBranchId: string,
    pageNumber: number,
    pageSize: number
  ) {
    return this.http.get(
      this.url +
      `api/Notification/GetAllForSecurityCompanyBranch?securityCompanyBranchId=${CompanyBranchId}&page=${pageNumber}&pageSize=${pageSize}`,
      {
        headers: {
          loader: 'true',
        },
      }
    );
  }
  addNotification(model: any) {
    return this.http.post(
      this.url +
      `api/Notification/Create`, model,
      {
        headers: {
          loader: 'true',
        },
      }
    );
  }

  addNotify(data: any) {
    data.highlightWords = ''
    data.highlightWordsEn = ''
    data.paramters = ''
    data.notificationType = 1
    return this.http.post(this.url + `api/Notification/Create`, data)
  }
}
