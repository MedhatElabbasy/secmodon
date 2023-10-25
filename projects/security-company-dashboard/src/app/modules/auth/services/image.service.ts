import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  personalIamge = new BehaviorSubject('');
  licenseImage = new BehaviorSubject('');
  companyLogo = new BehaviorSubject('');
  registerFile = new BehaviorSubject('');
  idProofUrl = new BehaviorSubject('');
  docLink = new BehaviorSubject(false);
  constructor() {}
}
