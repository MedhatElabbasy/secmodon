import { Component, OnInit } from '@angular/core';
import { ReportsService } from '../../../../services/reports.service';

@Component({
  selector: 'app-facts-report-details',
  templateUrl: './facts-report-details.component.html',
  styleUrls: ['./facts-report-details.component.scss']
})
export class FactsReportDetailsComponent implements OnInit {

  constructor(private _ReportsService: ReportsService) { }
  dailyFactsDetails: any;
  ngOnInit(): void {
    this._ReportsService.dailyFactsDetails.subscribe((res) => {
      this.dailyFactsDetails = res
      console.log(this.dailyFactsDetails);
    })


  }
}
