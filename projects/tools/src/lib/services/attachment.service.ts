import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class AttachmentService {
  private url;
  constructor(private http: HttpClient, @Inject('env') private env: any) {
    this.url = env.api;
  }

  uploadFile(name: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    if (file.size<=2000000) {
      return this.http.post(this.url + `api/Attachment/uploadFormFile`, formData);
    }
    else {
      return this.http.post(this.url + `api/Attachment/uploadFormFile`,{});
    }
  }

  getQRCode() {
    return this.http.get(this.url + `api/qrCode`, { responseType: 'text' });
  }
}
