import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'projects/client-app/src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OfferDetailsService {
  private readonly url = environment.api;

  constructor(private http: HttpClient) { }

  sendOffer(data: any) {
    return this.http.post(
      this.url + `api/ClientPriceOffers/Add`, data
    );
  }

  updateStatus(offerId: string, value: number) {
    return this.http.post(
      this.url + `api/ClientPriceOffers/UpdateOfferStatus?orderId=${offerId}&&optionSetName=offerStatus&&value=${value}`
      , {});
  }
  update(data: any) {
    return this.http.post(
      this.url + `api/ClientPriceOffers/Update`, data
    );
  }
  getOffer(id: string): any {
    return this.http.get(
      this.url + `api/ClientPriceOffers/GetAllByOrderId?Id=${id}`
    );
  }
  sendMessage(data: any) {
    return this.http.post(
      this.url + `api/ClientPriceOffers/AddOfferMessage`
      , data);
  }
  getMessages(id: string) {
    return this.http.post(
      this.url + `api/ClientPriceOffers/GetAllOfferMessage?Id=${id}`
      , {});
  }
}
