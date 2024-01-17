import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CanvasService, LangService, PAGINATION_SIZES } from 'projects/tools/src/public-api';
import { ReportsService } from '../../services/reports.service';
import { AuthService } from '../../../auth/services/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-receiving-delivering-vehicles',
  templateUrl: './receiving-delivering-vehicles.component.html',
  styleUrls: ['./receiving-delivering-vehicles.component.scss']
})
export class ReceivingDeliveringVehiclesComponent implements OnInit {

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
  vehicles!:any;
  allData!: any;
  messionID="missionDetails";
  vehicleDetails!:any;
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
    this._reports.getAllReceivingDeliveringVehicles().subscribe((res)=>{
      console.log(res);
     this.vehicles=res;
     this.allData = res;
    })
  }

  search() {
    // console.log(this.allData);
    this.vehicles = this.allData
    let myData: any[] = [];
    if (this.searchKey != '') {
      this.vehicles.filter((ele: any) => {
        let name = ele.receiverName
        let number = ele.vehicleNumber

        if (
          name.includes(this.searchKey.replace(/\s/g, '')) || number.includes(this.searchKey.replace(/\s/g, ''))
        ) {
          myData.push(ele);
        }
      });
      this.vehicles = myData;
    } else {


      this.vehicles = this.allData;
    }
  }

  details(mission:any,event:any){
    event.stopImmediatePropagation();
    this.vehicleDetails = mission;
    this._CanvasService.open(this.messionID);
  }

}
