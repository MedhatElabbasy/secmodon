import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CanvasService, LangService, PAGINATION_SIZES } from 'projects/tools/src/public-api';
import { CoveragesService } from '../../services/coverages.service';
import { Location } from '@angular/common';
import { coverage } from '../../models/coverage';
import { BehaviorSubject } from 'rxjs';
import { JobApplication } from '../../../jobs/models/job-app';
@Component({
  selector: 'app-coverage-received-orders',
  templateUrl: './coverage-received-orders.component.html',
  styleUrls: ['./coverage-received-orders.component.scss']
})
export class CoverageReceivedOrdersComponent implements OnInit {

  details = 'details'
  pageNumber = 1;
  pageSize = 10;
  total!: number;
  sizes = PAGINATION_SIZES;
  searchKey!: string
  coverageID!:number
  coverages!:any
  selectedCoverage!:any;
  isAr!: BehaviorSubject<boolean>;
  constructor(private _CanvasService: CanvasService, private location: Location , private route:ActivatedRoute,
    private _coverage:CoveragesService , public lang: LangService ) {
      this.isAr = this.lang.isAr;
     
     this.coverageID=this.route.parent?.snapshot.params['id']
     this.GetAllByJobIdInitData(this.coverageID)
     }

     GetAllByJobIdInitData(coverID:number){
   this._coverage.GetAllByJobId(coverID,this.pageNumber,this.pageSize).subscribe((res)=>{
    console.log(res);
    this.coverages=res.data
    this.total=res.totalCount;
   })
    }



  ngOnInit(): void {
  }
  showDetails(data: any) {
    this._CanvasService.open(this.details);
  }
  onPageSizeChange(number: any) {
    this.pageSize = +number.target.value;
  }
  onPageNumberChange(event: number) {
    this.pageNumber = event;
    //   this.getAll();
  }
  back() {
    this.location.back();
  }
  showAppDetails(cover:any){
  this._CanvasService.open('details');
  this.selectedCoverage=cover;
  }

  acceptGuardApplication(cover:any){
    
  }
  rejectGuardApplication(cover:any){}
}
