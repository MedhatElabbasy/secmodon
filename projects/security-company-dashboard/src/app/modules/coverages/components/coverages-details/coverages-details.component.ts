import { Component, OnInit, ViewChild } from '@angular/core';
import {
  CanvasService,
  LangService,
  LookupService,
  ModalService,
} from 'projects/tools/src/public-api';
import { PAGINATION_SIZES } from 'projects/tools/src/public-api';
import { Location } from '@angular/common';
import { ActivatedRoute, Route } from '@angular/router';
import { CoveragesService } from '../../services/coverages.service';
import { CoveragesModule } from '../../coverages.module';
import { coverage } from '../../models/coverage';
import { BehaviorSubject, Observable } from 'rxjs';
import { coveragesRoutes } from '../../routes/converages-routes';
import { Routing } from '../../../core/routes/app-routes';
import {
  FormBuilder,
  FormGroup,
  FormGroupDirective,
  Validators,
} from '@angular/forms';
import { Shift } from '../../../settings/models/shift';
import { Branch } from '../../../branches/models/branch';
import { Gender } from 'projects/client-app/src/app/modules/core/models/job';
import { BranchesService } from '../../../branches/services/branches.service';
import { AuthService } from '../../../auth/services/auth.service';
import { JobService } from '../../../jobs/services/job.service';
import { ShiftsService } from '../../../settings/services/shifts.service';
@Component({
  selector: 'app-coverages-details',
  templateUrl: './coverages-details.component.html',
  styleUrls: ['./coverages-details.component.scss'],
})
export class CoveragesDetailsComponent implements OnInit {
  details = 'details';
  pageNumber = 1;
  pageSize = 10;
  total!: number;
  sizes = PAGINATION_SIZES;
  searchKey!: string;
  coverageID!: number;
  Coverage!: coverage;
  isAr!: BehaviorSubject<boolean>;
  links!: any;

  //update and delete
  @ViewChild('form') form!: FormGroupDirective;
  updateData = 'updateData';
  now!: Date;
  coveragesForm!: FormGroup;
  securityCompany: number | undefined;
  allShiftTypes: Shift[] = [];
  allBranches: Branch[] = [];
  alljobTypes: any[] = [];
  allCoverages: any[] = [];
  totalCount!: number;
  genders: Gender[] = [];
  cities: any[] = [];

  constructor(
    private _CanvasService: CanvasService,
    private location: Location,
    private route: ActivatedRoute,
    private _coverage: CoveragesService,
    public lang: LangService,
    private _BranchesService: BranchesService,
    private _CoveragesService: CoveragesService,
    private auth: AuthService,
    private _JobsService: JobService,
    private fb: FormBuilder,
    private lookup: LookupService,
    public _ShiftsService: ShiftsService,
    public modal: ModalService
  ) {
    this.isAr = this.lang.isAr;
    this.route.params.subscribe((res: any) => {
      if (res) {
        this.coverageID = res.id;
        console.log(this.coverageID);
        this.links = {
          coverageReceivOrders: `/dashboard/${Routing.coverages.module}/${Routing.coverages.children.coverageDetails}/${this.coverageID}/${Routing.coverages.children.coverageReceivOrders}`,
          coverageGuards: `/dashboard/${Routing.coverages.module}/${Routing.coverages.children.coverageDetails}/${this.coverageID}/${Routing.coverages.children.coverageGuards}`,
        };
        this.getCoverageInitData(this.coverageID);
      }
    });

    //update and delete
    this.now = new Date();
    this.generateForm();
    this.getAllBranches();
    this.shiftTypes();
    this.Gender();
    this.jobType();
    this.allCities();
  }

  ngOnInit(): void {}

  getCoverageInitData(coverageID: number) {
    this._coverage.getCoverageByID(coverageID).subscribe((res) => {
      if (res) {
        console.log(res);
        this.Coverage = res;
      }
    });
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

  //update and delete

  generateForm() {
    this.coveragesForm = this.fb.group({
      jobTypeId: [null, Validators.required],
      shiftTypeId: [null, Validators.required],
      securityCompanyBranchId: [null, Validators.required],
      genderId: [null, Validators.required],
      cityId: [null, Validators.required],
      locationLat: [null, [Validators.required]],
      locationLng: [null, [Validators.required]],
      securityCompanyId: [null, [Validators.required]],

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
  }
  get controls(): any {
    return this.coveragesForm.controls;
  }
  update() {
    this.generateForm();
    this._CanvasService.open(this.updateData);
    console.log(this.Coverage);

    this.coveragesForm.patchValue(this.Coverage);
    let startDate = this.Coverage.coveringDate.split(' ')[0];
    let newStartDate =
      startDate.split('-')[2] +
      '-' +
      startDate.split('-')[1] +
      '-' +
      startDate.split('-')[0];

    let endDate = this.Coverage.coveringEndDate.split(' ')[0];
    let newEndDate =
      endDate.split('-')[2] +
      '-' +
      endDate.split('-')[1] +
      '-' +
      endDate.split('-')[0];
    this.controls['coveringDate'].setValue(new Date(newStartDate));
    this.controls['coveringEndDate'].setValue(new Date(newEndDate));
  }
  allCities() {
    this.lookup.getCity().subscribe((x) => {
      x.forEach((element) => {
        this.cities.push(element);
      });
      console.log(this.cities);
    });
  }

  getAllBranches() {
    this._BranchesService.getAllByCompanyId().subscribe((res) => {
      this.allBranches = res;
    });
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

    form.id = this.coverageID;
    this._CoveragesService.updateCoverages(form).subscribe((res) => {
      this._CanvasService.close(this.updateData);
      this.form.resetForm();
      this.getCoverageInitData(this.coverageID);
    });
  }
  Delete() {
    this.modal.open('deleteCoverage');
  }
  confirm() {
    this._CoveragesService.deleteCoverages(this.coverageID).subscribe((res) => {
      if (res) {
        this.modal.close('deleteCoverage');
        this.back();
      }
    });
  }
}
