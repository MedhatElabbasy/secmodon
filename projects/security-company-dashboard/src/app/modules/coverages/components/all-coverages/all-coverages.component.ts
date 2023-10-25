import { Component, OnInit, ViewChild } from '@angular/core';
import {
  CanvasService,
  LangService,
  LookupService,
  ModalService,
  Roles,
} from 'projects/tools/src/public-api';
import { Routing } from '../../../core/routes/app-routes';
import { ActivatedRoute, Router } from '@angular/router';

import { PAGINATION_SIZES } from 'projects/tools/src/public-api';

import { BranchesService } from '../../../branches/services/branches.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Branch } from '../../../branches/models/branch';
import { CoveragesService } from '../../services/coverages.service';
import { Observable } from 'rxjs';
import { ShiftsService } from '../../../settings/services/shifts.service';
import { Shift } from '../../../settings/models/shift';
import { JobService } from '../../../jobs/services/job.service';
import { Gender } from '../../../jobs/models/job-details.enum';
import {
  FormBuilder,
  FormGroup,
  FormGroupDirective,
  Validators,
} from '@angular/forms';
import { JobType } from 'projects/security-company-dashboard/src/environments/environment.staging';
import { Loader } from '../../../core/enums/loader.enum';

@Component({
  selector: 'app-all-coverages',
  templateUrl: './all-coverages.component.html',
  styleUrls: ['./all-coverages.component.scss'],
})
export class AllCoveragesComponent implements OnInit {
  @ViewChild('form') form!: FormGroupDirective;
  addData = 'addData';
  pageNumber = 1;
  pageSize = 10;
  isEdit: boolean = false;
  total!: number;
  now!: Date;
  isAr!: Observable<boolean>;
  sizes = PAGINATION_SIZES;
  coveragesForm!: FormGroup;
  searchKey!: string;
  securityCompany: number | undefined;
  allShiftTypes: Shift[] = [];
  allBranches: Branch[] = [];
  alljobTypes: any[] = [];
  allCoverages: any[] = [];
  totalCount!: number;
  genders: Gender[] = [];
  cities: any[] = [];
  id!: number;
  hide = true
  constructor(
    private _CanvasService: CanvasService,
    private router: Router,
    private _BranchesService: BranchesService,
    private _CoveragesService: CoveragesService,
    private auth: AuthService,
    public lang: LangService,
    private _JobsService: JobService,
    private fb: FormBuilder,
    private lookup: LookupService,
    public _ShiftsService: ShiftsService,
    public modal: ModalService,
    public route: ActivatedRoute
  ) {
    this.isAr = this.lang.isAr;
    this.now = new Date();
    this.generateForm();

  }
  ngOnInit(): void {
    this.securityCompany = this.auth?.snapshot?.userInfo?.id;


    let data = this.route.snapshot.data['initData'];
    this.allCoverages = data.data;
    this.totalCount = data.totalCount;
    this.getAllBranches();
    this.shiftTypes();
    this.Gender();
    this.jobType();
    this.allCities();
  }
  generateForm() {
    this.coveragesForm = this.fb.group({
      jobTypeId: [null, Validators.required],
      shiftTypeId: [null, Validators.required],
      securityCompanyBranchId: [null, Validators.required],
      genderId: [null, Validators.required],
      cityId: [null, Validators.required],
      locationLat: [null, [Validators.required]],
      locationLng: [null, [Validators.required]],

      jobDescription: [
        null,
        [
          Validators.required,
          Validators.pattern(
            /^[\u0621-\u064A][\u0621-\u064A \n0-9$&+,:;=?@#|'<>.^*()%!-\/]{1,1000}$/
          ),
        ],
      ],
      jobReqiurement: [
        null,
        [
          Validators.required,
          Validators.pattern(
            /^[\u0621-\u064A][\u0621-\u064A \n0-9$&+,:;=?@#|'<>.^*()%!-\/]{1,1000}$/
          ),
        ],
      ],
      locationName: [null, [Validators.required]],
      jobDescriptionEN: [
        null,
        [
          Validators.required,
          Validators.pattern(
            /^[A-Za-z][[0-9A-Za-z \n$&+,:;=?@#|'<>.^*()%!-\/]{1,1000}$/
          ),
        ],
      ],
      jobReqiurementEN: [
        null,
        [
          Validators.required,
          Validators.pattern(
            /^[A-Za-z][[0-9A-Za-z \n$&+,:;=?@#|'<>.^*()%!-\/]{1,1000}$/
          ),
        ],
      ],
      coveringUniform: [null, Validators.required],
      experinceReqiured: [null, [Validators.required, Validators.min(0)]],

      openJobNumber: [null, [Validators.required, Validators.min(1)]],
      coveringAmount: [null, [Validators.required, Validators.min(1)]],
      coveringMinAge: [null, [Validators.required, Validators.min(18)]],

      isApprovedByMainBranch: true,
      isCovering: true,
      isCoveringComplete: false,

      coveringDate: [null, Validators.required],
      coveringEndDate: [null, Validators.required],
      coveringStartTime: [null, Validators.required],
      coveringEndTime: [null, Validators.required],
    });

    let isMainBranch = this.auth.snapshot.userInfo?.securityCompanyBranch.isMainBranch
    if (!isMainBranch) {
      let branchId = this.auth.snapshot.userInfo?.securityCompanyBranch.id
      this.coveragesForm.controls['securityCompanyBranchId'].setValue(branchId)
      this.hide = false

    }
  }

  get controls(): any {
    return this.coveragesForm.controls;
  }
  add() {
    this.isEdit = false;
    this.generateForm();

    this._CanvasService.open(this.addData);
  }
  update(id: number) {
    this.generateForm();
    this.isEdit = true;
    this.id = id;
    this._CoveragesService.getCoverage(id).subscribe((res) => {
      if (res) {
        this._CanvasService.open(this.addData);
        this.coveragesForm.patchValue(res);
        let startDate = res.coveringDate.split(' ')[0];
        let newStartDate =
          startDate.split('-')[2] +
          '-' +
          startDate.split('-')[1] +
          '-' +
          startDate.split('-')[0];

        let endDate = res.coveringEndDate.split(' ')[0];
        let newEndDate =
          endDate.split('-')[2] +
          '-' +
          endDate.split('-')[1] +
          '-' +
          endDate.split('-')[0];
        this.controls['coveringDate'].setValue(new Date(newStartDate));
        this.controls['coveringEndDate'].setValue(new Date(newEndDate));
      }
    });
  }
  allCities() {
    this.lookup.getCity().subscribe((x) => {
      x.forEach((element) => {
        this.cities.push(element);
      });
      console.log(this.cities);
    });
  }
  onPageSizeChange(number: any) {
    this.pageSize = +number.target.value;
    this.getAllCoverages(this.pageNumber, this.pageSize);
  }
  onPageNumberChange(event: number) {
    this.pageNumber = event;
    this.getAllCoverages(this.pageNumber, this.pageSize);
  }
  getDetails(id: string) {
    let url = `${Routing.dashboard}/${Routing.coverages.module}/${Routing.coverages.children.coverageDetails}`;
    this.router.navigate([url, id]);
  }

  getAllBranches() {
    this._BranchesService.getAllByCompanyId().subscribe((res) => {
      this.allBranches = res;
    });
  }
  getAllCoverages(number: number, page: number) {



    let role = this.auth.snapshot.userIdentity?.role;
    let isMainBranch = this.auth.snapshot.userInfo?.securityCompanyBranch.isMainBranch
    if (role == Roles.SecuritCompany || isMainBranch) {
      this._CoveragesService.getAllCoverages(number, page).subscribe((res) => {
        console.log(res);
        this.allCoverages = res.data;
        this.totalCount = res.totalCount;
      });
    } else {
      this._CoveragesService.getAllCoveragesBybranch(number, page).subscribe((res) => {
        this.allCoverages = res.data;
        this.totalCount = res.totalCount;
      });
    }



  }
  shiftTypes() {
    this._ShiftsService.getAll(1, 1000).subscribe((res) => {
      console.log(res);

      this.allShiftTypes = res.data;
    });
  }
  Gender() {
    // this._JobsService.getGender().subscribe((res) => {
    //   console.log(res);
    //   this.genders = res;
    // });
    this.lookup.getGender().subscribe((x) => {
      x.forEach((element) => {
        this.genders.push(element);
      });
      console.log(this.cities);
    });
  }
  jobType() {
    this._JobsService.getJobType().subscribe((res) => {
      console.log(res);

      this.alljobTypes = res;
    });
  }
  onSubmit() {
    if (this.coveragesForm.invalid) return;
    let form = this.coveragesForm.value;
    form.securityCompanyId = this.securityCompany;
    if (!this.isEdit) {
      this._CoveragesService.addCoverages(form).subscribe((res) => {
        this._CanvasService.close(this.addData);
        this.form.resetForm();
        this.getAllCoverages(this.pageNumber, this.pageSize);
      });
    } else {
      form.id = this.id;
      this._CoveragesService.updateCoverages(form).subscribe((res) => {
        this._CanvasService.close(this.addData);
        this.form.resetForm();
        this.getAllCoverages(this.pageNumber, this.pageSize);
      });
    }
  }
  Delete(id: number) {
    this.id = id;
    this.modal.open('deleteCoverage');
  }
  confirm() {
    this._CoveragesService.deleteCoverages(this.id).subscribe((res) => {
      if (res) {
        this.modal.close('deleteCoverage');
        this.getAllCoverages(this.pageNumber, this.pageSize);
      }
    });
  }
  search() {
    if (!this.searchKey) {
      this.getAllCoverages(this.pageNumber, this.pageSize);
    } else {
      this.searchItems(this.searchKey, this.pageNumber, this.pageSize);
    }
  }

  searchItems(value: string, number: number, page: number) {
    this._CoveragesService
      .search(value, number, page, Loader.no)
      .subscribe((res) => {
        this.allCoverages = res.data;
        this.totalCount = res.totalCount;
      });
  }
}
