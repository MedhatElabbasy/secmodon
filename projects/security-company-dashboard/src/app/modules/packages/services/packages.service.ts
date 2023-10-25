import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Package } from './../model/package';
import { environment } from 'projects/security-company-dashboard/src/environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { items } from './../model/items';
@Injectable({
  providedIn: 'root',
})
export class PackagesService {
  private readonly url = environment.api;
  myPackage = new BehaviorSubject<items>({
    numOfGuards: 0,
    attendance: 0,
    liveTracking: 0,
    reports: 0,
    branches: 0,
    numOfUsers: 0,
    ReceivingOffersFromClients: 0,
    numberOfJobsOffered: 0,
    numberOfEmploymentContracts: 0,
    technicalSupport: 0,
  });
  constructor(private http: HttpClient) {}
  getAll(): Observable<Package[]> {
    return this.http.get<Package[]>(`${this.url}api/Package/GetAll`);
  }

  AddCompanyPackage(model: any): Observable<any> {
    return this.http.post(`${this.url}api/CompanyPackage/Add`, model);
  }
  enrollPackage(model: any): Observable<any> {
    return this.http.post(`${this.url}api/CompanyPackageEnrollment/Add`, model);
  }
  getLastPackage(id: number) {
    return this.http.get(
      `${this.url}api/CompanyPackageEnrollment/GetLastByCompanyId?id=${id}`
    );
  }
  updatePayment(model: any) {
    return this.http.post(
      `${this.url}api/CompanyPackageEnrollment/UpdatePayment`,
      model
    );
  }
}
