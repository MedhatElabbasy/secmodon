import { data } from './../../../contracts/components/additional-data/model/data';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { arLocale, defineLocale, enGbLocale } from 'ngx-bootstrap/chronos';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { environment } from 'projects/security-company-dashboard/src/environments/environment.staging';
import { map, Observable } from 'rxjs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import {
  convertDateToString,
  LangService,
  language,
  PAGINATION_SIZES,
  Roles,
} from 'projects/tools/src/public-api';
import { AuthService } from '../../../auth/services/auth.service';
import { Loader } from '../../../core/enums/loader.enum';
import { Incident } from '../../models/incident';
import { ReportsService } from '../../services/reports.service';
import { ClientsService } from '../../../client/services/clients.service';
import { ngxCsv } from 'ngx-csv';


@Component({
  selector: 'app-incident',
  templateUrl: './incident.component.html',
  styleUrls: ['./incident.component.scss']
})
export class IncidentComponent implements OnInit {
  private _hubConnection!: HubConnection;
  id!: string;
  dowenload: any[] = [];
  delete!: boolean;
  data: any;
  allData!: Incident[];
  filter: boolean = false;
  clientFilter: boolean = false;
  myFile!: any;
  pageNumber = 1;
  pageSize = 10;
  total!: number;
  sizes = [...PAGINATION_SIZES];
  date = new FormControl({ 0: new Date(), 1: new Date() });
  report!: any;
  maxDate = new Date();
  yesterday!: Date;
  display: boolean = false;
  selectedGallery!: any[];
  searchKey = '';
  clientData!: any[];

  constructor(
    private reports: ReportsService,
    private auth: AuthService,
    public lang: LangService,
  ) {
    this.connectHub();
  }

  ngOnInit(): void {



  }

  connectHub() {
    this._hubConnection = new HubConnectionBuilder()
      .withUrl(environment.hub)
      .build();

    this._hubConnection
      .start()
      .then(() => {
        this._hubConnection.invoke(
          'AddToGroup',
          `${this.auth.snapshot.userInfo?.id}-incident`
        );
      })
      .catch((err) =>
        console.log('error while establishing signalr connection')
      );
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this._hubConnection.stop();
  }

}
