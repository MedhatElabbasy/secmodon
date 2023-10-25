import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'projects/security-company-dashboard/src/environments/environment';
import { SecurityCompany } from 'projects/tools/src/public-api';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private readonly url = environment.api;
  constructor(private http: HttpClient) {}


  updateUserInfo(model: any,id:number) {
    return this.http.post(this.url + `api/SecurityCompany/UserInfoUpdateSecurityCompany?scId=${id}`, model);
  }

  
  updateBankInfo(model: any,id:number) {
    return this.http.post(this.url + `api/SecurityCompany/BankInfoUpdateSecurityCompany?scId=${id}`, model);
  }
  addAvaliableService(model:any){
    return this.http.post(this.url+`api/SecurityCompany/AddAvilableServcie` , model)
  }

  deleteAllServices(id:number){
    return this.http.post(this.url+`api/SecurityCompany/DeleteAvilableServcie?id=${id}` , null)
  }

  updateDescritionAndLinks (companyID:number , model:any){
    return this.http.post(this.url+`api/SecurityCompany/BaseInfoUpdateSecurityCompany?scId=${companyID}` , model)
  }

  updateOverView(model:any){
    return this.http.post(this.url+`api/SecurityCompany/UpdateOverviewDTO`, model)
  }

  updatePhoto(photoId:number , companyId : number){
    return this.http.post(this.url+`api/SecurityCompany/UpdatePhoto?companyId=${companyId}&photoId=${photoId}` , null)
  }
}

