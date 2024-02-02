import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Guard } from 'projects/security-company-dashboard/src/app/modules/core/models/guard';
import { securityGuard } from 'projects/security-company-dashboard/src/app/modules/jobs/models/job-app';
import { ClientShift } from 'projects/security-company-dashboard/src/app/modules/schedules/models/client-shift';
import { CustomValidators } from 'projects/tools/src/lib/validators/custom-validators.class';
import {
  AcceptedImage,
  CanvasService,
  LangService,
  ModalService,
  Roles,
} from 'projects/tools/src/public-api';
import { ClientSite } from '../../../../models/client-site';
import { ClientSiteService } from '../../../../services/client-site.service';
import { AuthService } from 'projects/security-company-dashboard/src/app/modules/auth/services/auth.service';


@Component({
  selector: 'app-client-sites',
  templateUrl: './client-sites.component.html',
  styleUrls: ['./client-sites.component.scss'],
})
export class ClientSitesComponent implements OnInit {
  @ViewChild('siteInfo') firstForm!: FormGroupDirective;
  @ViewChild('siteLocation') secondForm!: FormGroupDirective;
  @ViewChild('siteLocationTab') siteLocationTab!: ElementRef<HTMLButtonElement>;
  @ViewChild('siteEdit') editForm!: FormGroupDirective;
  addCanvas = 'add-site';
  successAlert: string = 'successAlert';
  siteForm!: FormGroup;
  modalId = 'modalId';
  allBranches!: any;
  acceptedExtensions = [...AcceptedImage];
  clientId: any;
  shifts!: ClientShift[];
  supervisors!: Guard[];
  siteInfoForm!: FormGroup;
  securityCompanyClientId!: string;
  sites!: any[];
  allData!:any[];
  siteEditForm!: FormGroup;
  editSiteCanvas = 'edit-site-canvas';
  selectedSite!: any;
  id!: string;
  searchKey = '';
  searchtype:boolean=false;
  constructor(
    private fb: FormBuilder,
    private canvas: CanvasService,
    private route: ActivatedRoute,
    private auth: AuthService,
    public lang: LangService,
    private siteServices: ClientSiteService,
    private modal: ModalService
  ) {
    this.securityCompanyClientId = this.route.parent?.snapshot.params['id'];
    this.generateForm();
   // this.getClientSites();
    console.log(this.auth.snapshot.userInfo)
  }

  public get SiteLocations(): FormArray {
    return this.siteForm.get('siteLocations') as FormArray;
  }

  public get SupervisorsShifts(): FormArray {
    return this.siteInfoForm.get('siteSupervisorShifts') as FormArray;
  }

  get siteInfoControls(): any {
    return this.siteInfoForm.controls;
  }

  get editSiteControls(): any {
    return this.siteEditForm.controls;
  }

  ngOnInit() {
    this.searchtype=false;
    this.siteServices.allBranches().subscribe((res) => {
      this.allBranches = res;
    });
    this.route.data.subscribe((res) => {
      this.shifts = res['initData'].shifts;
      this.supervisors = res['initData'].supervisors.map((e: any) => {
        e.securityGuard.userName =
          e.securityGuard.firstName + ' ' + e.securityGuard.lastName;
        return e;
      });
      this.sites = res['initData'].sites;
      this.allData = res['initData'].sites;
    });
  }

  generateForm() {
    this.siteInfoForm = this.fb.group({
      securityCompanyClientId: [this.securityCompanyClientId],
      siteName: [null, [Validators.required]],
      siteNumber:[null, [Validators.required]],
      siteAddress: [null, [Validators.required]],
      siteLat: [null, [Validators.required]],
      siteLong: [null, [Validators.required]],
      siteHight: [null, [Validators.required, Validators.min(3)]],
      sitePhotoId: [null, [Validators.required]],
      enableGeolocation: [false],
      geolocationLenghtInMetter: [{ value: null, disabled: true }],
      siteDescription: [null, [Validators.required]],
      totalNumberOfGurds: [null, [Validators.required, Validators.min(1)]],
      securityCompanyBranchId: [null, [Validators.required]],
      siteSupervisorShifts: this.fb.array([
        this.fb.group({
          clientShiftScheduleId: [null, [Validators.required]],
          companySecurityGuardId: [null, [Validators.required]],
          clientSiteId: [''],
        }),
      ]),
    });

    this.siteForm = this.fb.group({
      siteLocations: this.fb.array([
        this.fb.group({
          name: [null, [Validators.required]],
          numberOfGuards: [null, [Validators.required]],
          photoId: [null, [Validators.required]],
          statusId: [''],
          locationAddress: [null, [Validators.required]],
          locationLat: [null, [Validators.required]],
          locationLong: [null, [Validators.required]],
          locationHight: [null, [Validators.required]],
        }),
      ]),
    });

    this.siteEditForm = this.fb.group({
      securityCompanyBranchId: [null, [Validators.required]],
      securityCompanyClientId: [this.securityCompanyClientId],
      siteName: [null, [Validators.required]],
      siteNumber:[null, [Validators.required]],
      siteAddress: [null, [Validators.required]],
      siteLat: [null, [Validators.required]],
      siteLong: [null, [Validators.required]],
      siteHight: [null, [Validators.required, Validators.min(3)]],
      sitePhotoId: [null, [Validators.required]],
      enableGeolocation: [null, [Validators.required]],
      geolocationLenghtInMetter: [{ value: null, disabled: true }],
      siteDescription: [null, [Validators.required]],
      totalNumberOfGurds: [null, [Validators.required, Validators.min(1)]],
    });
  }

  onAddSite() {
    this.firstForm.resetForm();
    this.secondForm.resetForm();
    this.canvas.open(this.addCanvas);
  }

  rangeValidatorsListener(group: FormGroup) {
    const control = group.controls['geolocationLenghtInMetter'] as FormControl;
    let change = group.controls['enableGeolocation'].value;

    if (change) {
      control.enable();
      control.setValidators([Validators.required, Validators.min(1)]);
      control.updateValueAndValidity();
    } else {
      control.clearValidators();
      control.updateValueAndValidity();
      control.disable();
    }
  }

  addShiftWithSupervisor() {
    let shiftsWithSupervisors = this.fb.group({
      clientShiftScheduleId: [null, [Validators.required]],
      companySecurityGuardId: [null, [Validators.required]],
      clientSiteId: [null],
    });

    this.SupervisorsShifts.push(shiftsWithSupervisors);
  }

  removeShiftsAndSupervisors(index: number) {
    this.SupervisorsShifts.removeAt(index);
  }

  removeLocation(index: number) {
    this.SiteLocations.removeAt(index);
  }

  addLocation() {
    let location = this.fb.group({
      name: [null, [Validators.required]],
      numberOfGuards: [null, [Validators.required]],
      photoId: [null, [Validators.required]],
      statusId: [null, [Validators.required]],
      locationAddress: [null, [Validators.required]],
      locationLat: [null, [Validators.required]],
      locationLong: [null, [Validators.required]],
      locationHight: [null, [Validators.required]],
    });

    this.SiteLocations.push(location);
  }

  nextStep() {
    if (this.siteInfoForm.invalid) return;
    this.siteLocationTab.nativeElement.click();
  }

  addSite() {
    let model: ClientSite = Object.assign(
      this.siteForm.value,
      this.siteInfoForm.value
    );
    if (model.enableGeolocation == null) {
      model.enableGeolocation = false;
    }
    model.securityCompanyClientId = this.securityCompanyClientId;

    this.siteServices.addSite(model).subscribe((res) => {
      this.canvas.close(this.addCanvas);
      this.firstForm.resetForm();
      this.secondForm.resetForm();
      this.getClientSites();
    });
  }

  getClientSites() {
    this.searchtype=false;
    // this.siteServices
    //   .getAllByClientId(this.securityCompanyClientId)
    //   .subscribe((res) => {
    //     this.sites = [...res];
    //     this.allData = [...res];
    //   });
    // this.siteServices.getAllBySecurityCompanyClientId(this.securityCompanyClientId).subscribe((res)=>{
    //   this.sites = [...res];
    // this.allData = [...res];
    // })
    let role = this.auth.snapshot.userIdentity?.role;
    let isMainBranch =
      this.auth.snapshot.userInfo?.securityCompanyBranch.isMainBranch;
    if (role == Roles.SecuritCompany || isMainBranch) {
      this.siteServices
      .getAllByClientId(this.securityCompanyClientId)
      .subscribe((res) => {
        this.sites = [...res];
        this.allData = [...res];
      });
    }
    else{
      console.log(this.auth.snapshot.userInfo?.securityCompanyBranch.id)
      let branchID : string | any= this.auth.snapshot.userInfo?.securityCompanyBranch.id
      this.siteServices.GetAllSiteLocationsByClientIdSecurityCompanyBranch(this.securityCompanyClientId , branchID).subscribe((res)=>{
        this.sites = [res];
        this.allData = [res];
      })

    }
  }

  onEdit(event: any) {
    this.selectedSite = event;
    this.siteEditForm.patchValue(event);
    console.log(this.siteEditForm);
    this.rangeValidatorsListener(this.siteEditForm);
    this.canvas.open(this.editSiteCanvas);
  }
  onDelete(event: ClientSite) {
    this.selectedSite = event;
    this.id = this.selectedSite.id;
    this.modal.open(this.modalId)
  }
  deleteSite() {
    this.siteServices.deleteSiteLocationAndAllDetails(this.id).subscribe((res) => {
      if (res) {
        this.modal.open(this.successAlert);
        this.getClientSites();
      }
    });
  }
  edit() {
    if (this.siteEditForm.invalid) return;
    let model: ClientSite = this.siteEditForm.value;
    model.id = this.selectedSite.id;
    model.siteLocations = [];
    model.siteSupervisorShifts = [];
    this.siteServices.updateSite(model).subscribe((res) => {
      this.canvas.close(this.editSiteCanvas);
      this.editForm.resetForm();
      this.getClientSites();
    });
  }

  search() {
    // console.log(this.allData);
    this.searchtype=true;
    this.sites = this.allData
    let myData: any[] = [];
    if (this.searchKey != '') {
      this.sites.filter((ele: any) => {
        let name = ele.siteName 
        let number = ele.siteNumber
        if (
          name.includes(this.searchKey.replace(/\s/g, '')) || number?.includes(this.searchKey.replace(/\s/g, ''))
        ) {
          myData.push(ele);
        }
      });
      this.sites = myData;
    } else {
      this.searchtype=false;
      this.sites = this.allData;
    }
  }
}
