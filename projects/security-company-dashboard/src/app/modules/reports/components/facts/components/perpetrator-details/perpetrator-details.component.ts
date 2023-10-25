import { Component, OnInit } from '@angular/core';
import { ReportsService } from '../../../../services/reports.service';

@Component({
  selector: 'app-perpetrator-details',
  templateUrl: './perpetrator-details.component.html',
  styleUrls: ['./perpetrator-details.component.scss']
})
export class PerpetratorDetailsComponent implements OnInit {

  constructor(private _ReportsService: ReportsService) { }
  dailyFactsDetails: any;
  ngOnInit(): void {
    this._ReportsService.dailyFactsDetails.subscribe((res) => {
      this.dailyFactsDetails = res
      console.log(this.dailyFactsDetails);
    })


  }


  

}
