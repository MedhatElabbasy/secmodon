import { Component, OnInit } from '@angular/core';
import { ReportsService } from '../../../../services/reports.service';

@Component({
  selector: 'app-general-facts',
  templateUrl: './general-facts.component.html',
  styleUrls: ['./general-facts.component.scss']
})
export class GeneralFactsComponent implements OnInit {
  constructor(private _ReportsService: ReportsService) { }
  dailyFactsDetails: any;
  ngOnInit(): void {
    this._ReportsService.dailyFactsDetails.subscribe((res) => {
      this.dailyFactsDetails = res
      console.log(this.dailyFactsDetails);
    })


  }
}
