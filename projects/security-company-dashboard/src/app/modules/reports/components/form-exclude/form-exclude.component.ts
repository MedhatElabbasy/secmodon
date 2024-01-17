import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { arLocale, defineLocale, enGbLocale } from 'ngx-bootstrap/chronos';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { CanvasService, LangService, PAGINATION_SIZES, language } from 'projects/tools/src/public-api';
import { Routing } from '../../../core/routes/app-routes';
import { ReportsService } from '../../services/reports.service';

@Component({
  selector: 'app-form-exclude',
  templateUrl: './form-exclude.component.html',
  styleUrls: ['./form-exclude.component.scss']
})
export class FormExcludeComponent implements OnInit {
  id!: number;
  delete!: boolean;
  data: any;
  filter: boolean = false;
  clientData!: any[];
  clientFilter: boolean = false;
  maxDate = new Date();
  searchKey = '';
  visitorsReport!: any[];
  allData!:any;
  date = new FormControl(new Date());
  transferDetails!:any;
  pageNumber = 1;
  pageSize = 10;
  total!: number;
  sizes = [...PAGINATION_SIZES];
  transferForm!:any;
  canvasId='updateTransferDetails'
  accreOptions = ['موافقة', 'عدم موافقة'];
  responseOptions = ['مناسب', 'غير مناسب'];
  options = [{name:'غياب',id:1},{name:'حالة مخلة بالأنظمة',id:2} ,{name:'عدم تنفيذ التعليمات',id:3} ,{name:'أخرى',id:4} ];
  constructor(public lang: LangService,private localeService: BsLocaleService ,
     private _router: Router , private _reports:ReportsService ,private fb: FormBuilder,
     public _canvas: CanvasService,) {
      this.getAllData();
      this.generateForm();
      }

  ngOnInit(): void {
  }

  getAllData(){
    this._reports.AllTransferBySecurityCompanyId().subscribe((res)=>{
      console.log(res);
   this.transferDetails=res;
   this.allData = res;
    })
  }

  initDatePiker() {
    defineLocale('ar', arLocale);
    defineLocale('en', enGbLocale);
    this.lang.language.subscribe((res) => {
      res === language.ar
        ? this.localeService.use('ar')
        : this.localeService.use('en');
    });
  }


  onPageSizeChange(number: any) {
    this.pageSize = +number.target.value;
  }

  onPageNumberChange(event: number) {
    this.pageNumber = event;
  }

  generateForm(){
    this.transferForm=this.fb.group({
      id: [null, [Validators.required]],
      createDate: [null, [Validators.required]],
      securityGuardId: [null, [Validators.required]],
      reasonStatusType: [null, [Validators.required]],
      reasonForTransfer: [null, [Validators.required]],
      securityCompanyId: [null, [Validators.required]],
      securityOfficial: [null, [Validators.required]],
      contractorProjectManager: [null, [Validators.required]],
      securityOfficialSignature: [null, [Validators.required]],
      contractorProjectManagerSignature: [null, [Validators.required]],
      response: [null, [Validators.required]],
      inappropriateReason: [null, [Validators.required]],
      responserName: [null, [Validators.required]],
      responseSignature: [null, [Validators.required]],
      accreditationOK: [null, [Validators.required]],
      dependenceDisapprovalReason: [null, [Validators.required]],
      branchManager: [null, [Validators.required]],
      branchManagerSignature: [null, [Validators.required]],
      number: [null, [Validators.required]],
    })
  }

  // getDataFilter(filter: string) {
  //   this.filter = true;
  //   this.clientFilter = false;
  //   this.data = null;
  //   if (filter == 'client') {
  //     this.clientFilter = true;
  //   }
  // }
  // displayFilter(event: any) {
  //   this.id = event.value;
  //   this.delete = false;
  //   //this.getReports();
  // }
  // deleteFilter() {
  //   this.filter = false;
  //   this.clientFilter = false;
  //   this.data = null;
  //   this.delete = true;
  //  // this.getReports();
  // }

  search() {
    // console.log(this.allData);
    this.transferDetails = this.allData
    let myData: any[] = [];
    if (this.searchKey != '') {
      this.transferDetails.filter((ele: any) => {
        let name = ele?.securityGuard?.firstName +" "+ ele?.securityGuard?.middleName +" "+
        ele?.securityGuard?.lastName
        let jobType = ele.securityGuard?.jobType?.name

        if (
          name.includes(this.searchKey.replace(/\s/g, '')) || jobType.includes(this.searchKey.replace(/\s/g, ''))
        ) {
          myData.push(ele);
        }
      });
      this.transferDetails = myData;
    } else {


      this.transferDetails = this.allData;
    }
  }


  download(){

  }
  openModal(transfer:any){
this._canvas.open(this.canvasId);
this.transferForm.patchValue(transfer);
//this.transferForm.controls['reasonStatusType'].setValue(transfer.reasonStatusType)
  }

  reset(){

  }

  
  get controls(): any {
    return this.transferForm.controls;
  }

  createNewRequest(){
    this._router.navigate([`/dashboard/${Routing.reports.module}/${Routing.reports.children.formExclude}/${Routing.reports.children.excludeNewRequest}`])
  }

  onSubmit(transferForm:FormGroup){
    console.log(transferForm);
    this._reports.updateTransferDetails(transferForm.value).subscribe((res)=>{
      console.log(res);
      this.getAllData();
      this._canvas.close(this.canvasId)
    })
  }

}
