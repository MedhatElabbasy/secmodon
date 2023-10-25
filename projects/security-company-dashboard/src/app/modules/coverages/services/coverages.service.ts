import { Injectable } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';

import { environment } from 'projects/client-app/src/environments/environment';
import { Observable } from 'rxjs';
import { Pagination } from 'projects/tools/src/public-api';
import { HttpClient } from '@angular/common/http';
import { Loader } from '../../core/enums/loader.enum';

@Injectable({
  providedIn: 'root',
})
export class CoveragesService {
  private readonly url = environment.api;
  constructor(private auth: AuthService, private http: HttpClient) { }
  getAllCoverages(
    pageNumber: number,
    pageSize: number
  ): Observable<Pagination<any>> {
    let id = this.auth.snapshot.userInfo?.id;
    return this.http.get<any>(
      this.url +
      `api/CoveringCompanyJob/GetAllCoveringByCompanyId?id=${id}&page=${pageNumber}&pageSize=${pageSize}`
    );
  }
  getAllCoveragesBybranch(
    pageNumber: number,
    pageSize: number
  ): Observable<Pagination<any>> {
    let id = this.auth.snapshot.userInfo?.id;
    let branchId = this.auth.snapshot.userInfo?.securityCompanyBranch.id;
    return this.http.get<any>(
      this.url +
      `api/CoveringCompanyJob/GetAllCoveringByCompanyIdAndBranchId?id=${id}&BranchId=${branchId}&page=${pageNumber}&pageSize=${pageSize}`
    );
  }
  getCoverageByID(id: number) {
    return this.http.get<any>(
      this.url + `api/CoveringCompanyJob/GetCoveringById?id=${id}`
    );
  }

  GetAllByJobId(id: number, pageNumber: number, pageSize: number) {
    return this.http.get<any>(
      this.url +
      `api/JobApplication/GetAllByJobId?JopId=${id}&page=${pageNumber}&pageSize=${pageSize}`
    );
  }

  addCoverages(data: any): Observable<any> {
    return this.http.post<any>(
      this.url + `api/CoveringCompanyJob/CreateCovering`,
      data
    );
  }
  updateCoverages(data: any): Observable<any> {
    return this.http.post<any>(
      this.url + `api/CoveringCompanyJob/UpdateCovering`,
      data
    );
  }

  getCoverage(id: number): Observable<any> {
    return this.http.get<any>(
      this.url + `api/CoveringCompanyJob/GetCoveringById?id=${id}`
    );
  }
  deleteCoverages(id: number): Observable<any> {
    return this.http.post<any>(
      this.url + `api/CoveringCompanyJob/DeleteCovering?id=${id}`,
      {}
    );
  }

  search(
    value: string,
    pageNumber: number,
    pageSize: number,
    loader: Loader
  ): Observable<Pagination<any>> {
    let id = this.auth.snapshot.userInfo?.id;
    return this.http.get<any>(
      this.url +
      `api/CoveringCompanyJob/SearchCovering?id=${id}&value=${value}&page=${pageNumber}&pageSize=${pageSize}`,
      {
        headers: {
          loader: loader,
        },
      }
    );
  }
}
