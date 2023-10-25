import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { ReportsService } from '../../../../services/reports.service';

@Component({
  selector: 'app-facts-details',
  templateUrl: './facts-details.component.html',
  styleUrls: ['./facts-details.component.scss']
})
export class FactsDetailsComponent implements OnInit {

  accedentId: string = ""
  constructor(private _ActivatedRoute: ActivatedRoute,
    private _ReportsService: ReportsService,
    private location: Location,
    private _Router: Router) {
    _ActivatedRoute.params.subscribe((res) => {
      console.log(res['id']);
      this.accedentId = res['id']
      this.getDailyFactsById(res['id'])

    })
  }
  ngOnInit(): void {

  }


  getDailyFactsById(dailyFactsId: string) {
    this._ReportsService.getDailyFactById(dailyFactsId).subscribe((res) => {
      console.log(res);
      this._ReportsService.dailyFactsDetails.next(res)
    })
  }


  back(): void {
    // this.location.back();
    this._Router.navigate(['/dashboard/reports/facts'])
  }

}
