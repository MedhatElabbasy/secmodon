import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'projects/security-company-dashboard/src/environments/environment';

import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class CompanyProfileService {
  private readonly url = environment.api;
  stepNumber = new BehaviorSubject<number>(0);
  constructor(private http: HttpClient, private auth: AuthService) {
    this.stepNumber.next(0);
  }

  checkCompanyComplete() {
    let id = this.auth.snapshot.userInfo?.id;
    return this.http.get(
      this.url + `api/CompanyProfile/CheckIsSecurityProfileComplete?id=${id}`
    );
  }

  completeCompany(data: any) {
    return this.http.post(
      this.url + `api/CompanyProfile/AddSecurityCompanyProfile`,
      data
    );
  }
}
