import { Component, OnInit } from '@angular/core';
import { ReportsService } from '../../../../services/reports.service';

@Component({
  selector: 'app-general-notes',
  templateUrl: './general-notes.component.html',
  styleUrls: ['./general-notes.component.scss']
})
export class GeneralNotesComponent implements OnInit {

  constructor(private _ReportsService: ReportsService) { }
  incidentDetails: any;
  ngOnInit(): void {
    this._ReportsService.incidentDetails.subscribe((res) => {
      this.incidentDetails = res
      console.log(this.incidentDetails);
    })


  }

}
