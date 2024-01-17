import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ReportsService } from '../../services/reports.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { missionsReport } from '../../models/missions-report';
import { CanvasService } from 'projects/tools/src/lib/services/canvas.service';
import { LangService, PAGINATION_SIZES } from 'projects/tools/src/public-api';


@Component({
  selector: 'app-missions',
  templateUrl: './missions.component.html',
  styleUrls: ['./missions.component.scss']
})
export class MissionsComponent implements OnInit {
  //allData!: VisitorsReport[];
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
  missions!:missionsReport[];
  allData: missionsReport[] = [];
  messionID="missionDetails";
  missionDetails!:missionsReport;
  display: boolean = false;
  selectedGallery: any[]=[];
  constructor(private _reports:ReportsService,  public lang: LangService,public _CanvasService:CanvasService,
    private route: ActivatedRoute , private auth: AuthService) { }

  ngOnInit(): void {
   this.companyId = this.auth.snapshot.userInfo?.id;
    console.log(this.companyId);
    this.getAllMissions()
  }

  onPageSizeChange(number: any) {
    this.pageSize = +number.target.value;
  }

  onPageNumberChange(event: number) {
    this.pageNumber = event;
  }

  getAllMissions(){
    this._reports.getAllMissionsBysecurityCompanyId().subscribe((res)=>{
      console.log(res);
     this.missions=res;
     this.allData = res;
    })
  }

  search() {
    // console.log(this.allData);
    this.missions = this.allData
    let myData: missionsReport[] = [];
    if (this.searchKey != '') {
      this.missions.filter((ele: any) => {
        let name = ele.taskName
        let description = ele.descrption

        if (
          name.includes(this.searchKey.replace(/\s/g, '')) || description.includes(this.searchKey.replace(/\s/g, ''))
        ) {
          myData.push(ele);
        }
      });
      this.missions = myData;
    } else {


      this.missions = this.allData;
    }
  }

  details(mission:missionsReport,event:any){
    event.stopImmediatePropagation();
    this.missionDetails = mission;
    this._CanvasService.open(this.messionID);
  }

  openGallery(gallery: any[] , event:any) {
  //  this.selectedGallery = gallery;
  event.stopImmediatePropagation();
    console.log(gallery);
    gallery.forEach((ele)=>{
      console.log(ele.photo.fullLink);
      this.selectedGallery.push(ele.photo.fullLink)
    })
    this.display = true;
  }

}
