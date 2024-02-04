import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportsService } from '../../../../../services/reports.service';
import { Routing } from 'projects/security-company-dashboard/src/app/modules/core/routes/app-routes';

@Component({
  selector: 'app-view-exclude-request',
  templateUrl: './view-exclude-request.component.html',
  styleUrls: ['./view-exclude-request.component.scss']
})
export class ViewExcludeRequestComponent implements OnInit {
  transferDetails!:any;
  constructor(private route: ActivatedRoute,private _reports:ReportsService , private _route:Router) {
    this.transferDetailsByID();
  }



  ngOnInit(): void {
  }

 transferDetailsByID(){
  this.route.params.subscribe((res) => {
    console.log(res);

    let id = res['id'];
  this._reports.getTransferDetailsByID(id).subscribe((res)=>{
    this.transferDetails=res
    console.log(res);

  })
  });
 }

 next(){
  this._route.navigate([`/${Routing.dashboard}/${Routing.reports.module}/${Routing.reports.children.formExclude}`])
 }

}
