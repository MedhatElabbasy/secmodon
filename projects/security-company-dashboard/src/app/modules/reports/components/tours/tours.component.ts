import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TourReport } from '../../models/tours-reports';
import { ReportsService } from '../../services/reports.service';
import { CanvasService } from 'projects/tools/src/lib/services/canvas.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { ModalService } from 'projects/tools/src/lib/services/modal.service';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { LangService, PAGINATION_SIZES } from 'projects/tools/src/public-api';

@Component({
  selector: 'app-tours',
  templateUrl: './tours.component.html',
  styleUrls: ['./tours.component.scss']
})
export class ToursComponent implements OnInit {
  id!: number;
  delete!: boolean;
  data: any;
  filter: boolean = false;
  clientData!: any[];
  clientFilter: boolean = false;
  pageNumber = 1;
  pageSize = 10;
  total!: number;
  sizes = [...PAGINATION_SIZES];
  date = new FormControl(new Date());
  visitorsReport!: any[];
  maxDate = new Date();
  searchKey = '';
  dowenload: any[] = [];
  companyId!:any;
  tours!:TourReport[];
  allData: TourReport[] = [];
  display: boolean = false;
  selectedGallery!: any[];
  tourID="tourDetails";
 tourDetails!:TourReport;
 checkPoints!:any;
  constructor(private _reports:ReportsService,  public lang: LangService,public _CanvasService:CanvasService,
    private route: ActivatedRoute ,private sanitizer: DomSanitizer, private auth: AuthService , public _model:ModalService) { }

  ngOnInit(): void {
   this.companyId = this.auth.snapshot.userInfo?.id;
    console.log(this.companyId);
    this.getAllTours()
  }

  onPageSizeChange(number: any) {
    this.pageSize = +number.target.value;
  }

  onPageNumberChange(event: number) {
    this.pageNumber = event;
  }

  getAllTours(){

    this._reports.getAllToursBysecurityCompanyId().subscribe((res)=>{
      console.log(res);
     this.tours=res;
     this.allData = res;
    })
  }

  safeCheckPointId(id: string): string {
    return 'id_' + id.replace(/[^a-zA-Z0-9]/g, '_');
  }
  
  search() {
    // console.log(this.allData);
    this.tours = this.allData
    let myData: TourReport[] = [];
    if (this.searchKey != '') {
      this.tours.filter((ele: any) => {
        let name = ele.tour.tourAddress
        let description = ele.tour.tourDescription

        if (
          name.includes(this.searchKey.replace(/\s/g, '')) || description.includes(this.searchKey.replace(/\s/g, ''))
        ) {
          myData.push(ele);
        }
      });
      this.tours = myData;
    } else {


      this.tours = this.allData;
    }
  }

  details(tour:TourReport,event:any){
    event.stopImmediatePropagation();
    this.tourDetails = tour;
    this.checkPoints=this.tourDetails.guardTourCheckPoints;
    this._model.open(this.tourID);
  }

  openGallery(gallery: any[]) {
    this.selectedGallery = [gallery];
    console.log(gallery);
    this._model.close(this.tourID);
    this.display = true;
  }

}
