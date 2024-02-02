import { PackagesService } from './../../../packages/services/packages.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  UntypedFormControl,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CustomValidators } from 'projects/tools/src/lib/validators/custom-validators.class';
import { Observable } from 'rxjs';
import {
  AcceptedFile,
  AttachmentService,
  CanvasService,
  CountryCode,
  LangService,
  mapTheme,
  ModalService,
  PAGINATION_SIZES,
} from 'projects/tools/src/public-api';
import { AuthService } from '../../../auth/services/auth.service';
import { Branch } from '../../models/branch';
import { CompanyUser } from '../../models/company-user';
import { SecurityCompanyUserService } from '../../services/security-company-user.service';
import { BranchesService } from '../../services/branches.service';

@Component({
  selector: 'app-branch-users',
  templateUrl: './branch-users.component.html',
  styleUrls: ['./branch-users.component.scss'],
})
export class BranchUsersComponent implements OnInit {
  @ViewChild('form') form!: FormGroupDirective;
  branch!: Branch;
  modalId3 = 'modalId3';
  users!: CompanyUser[];
  isAr!: Observable<boolean>;
  coords!: any;
  mapOptions!: google.maps.MapOptions;
  pageNumber = 1;
  pageSize = 10;
  total!: number;
  sizes = [...PAGINATION_SIZES];
  canvasId = 'crud-branch-users';
  userForm!: FormGroup;
  code = new FormControl('', [Validators.required]);
  codes: CountryCode[] = [];
  photoLink!: string | null;
  selectedUser!: any;
  modalId = 'delete_branch_user';
  searchKey = '';
  number: string = '';
  addClients='add_clients_to_user';
  deleteModalId='deleteClient'
  clientCompanies!:any;
  selectedChoices!:any;
  checkboxForm!: FormGroup;
  checkboxes!: FormArray;
  userID!:any;
  addModel!:any;
  addMode!:boolean;
  securityCompanyUserClient!:any;
  clientCompany!:any;
  constructor(
    private route: ActivatedRoute,
    private lang: LangService,
    public canvas: CanvasService,
    private fb: FormBuilder,
    private attachment: AttachmentService,
    private usersServices: SecurityCompanyUserService,
    private auth: AuthService,
    private PackagesService: PackagesService,
    private modal: ModalService,
    private _branch:BranchesService
  ) {
    this.isAr = this.lang.isAr;
    this.generateForm();
     // Initialize the form with a FormArray
    
  }


  // get checkboxes(): FormArray {
  //   return this.checkboxForm.get('checkboxes') as FormArray;
  // }


  ngOnInit(): void {
    this.getInitData();
    this.getAllSecurityCompaniesClients();
  }

  get MobileNumber(): FormControl | any {
    return this.userForm.controls['phoneNumber'];
  }

  get controls(): any {
    return this.userForm.controls;
  }

  getInitData() {
    this.route.data.subscribe((data) => {
      console.log(data);
      
      this.branch = data['initData'].branch;
      this.users = data['initData'].users;
      this.total = this.users.length;

      this.coords = {
        lat: +this.branch.locationLat!,
        lng: +this.branch.locationLng!,
      };
      this.codes = data['initData'].countries;

      this.mobileValidationListener();
      this.setDefaultCode();
    });

    this.mapOptions = {
      styles: mapTheme,
      zoom: 10,
    };
  }

  onPageSizeChange(number: any) {
    this.pageSize = +number.target.value;
  }
  generateForm() {
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      middleName: ['', [Validators.required]],
      nationalID: [
        null,
        [Validators.required, Validators.pattern('[1-2][\\d]{9}')],
      ],
      email: ['', [Validators.required, Validators.email]],
      isActive: [false],
      locations: [null, [Validators.required]],
      lat: [null, [Validators.required]],
      lng: [null, [Validators.required]],
      phoneNumber: [null, [Validators.required]],
      photoId: [null, [Validators.required]],
    });
  }

  mobileValidationListener() {
    this.code.valueChanges.subscribe((res) => {
      let code: CountryCode = this.codes.find(
        (e: CountryCode) => e.prefixCode == res
      )!;

      this.MobileNumber.clearValidators();
      this.MobileNumber.updateValueAndValidity();

      this.MobileNumber.addValidators([
        Validators.pattern(code.regex),
        Validators.required,
      ]);
      this.MobileNumber.updateValueAndValidity();
    });
  }

  setDefaultCode() {
    let defaultCountry = this.codes.find((element: CountryCode) => {
      return element.ioS2 === '+966';
    })!;
    this.code.setValue(defaultCountry.prefixCode);
  }

  onImageUpload(event: any) {
    let arr = event.target.files[0].name.split('.');
    const extension = arr[arr.length - 1].toLowerCase();

    if (!AcceptedFile.includes(extension)) {
      (this.controls['profileImageId'] as UntypedFormControl).setErrors({
        notValid: true,
      });
      this.photoLink = null;
      return;
    } else {
      let url = URL.createObjectURL(event.target.files[0]);
      (this.controls['photoId'] as UntypedFormControl).setErrors({
        notValid: null,
      });
      this.attachment
        .uploadFile(event.target.files[0].name, event.target.files[0])
        .subscribe((res) => {
          this.photoLink = url;
          this.controls['photoId'].setValue(res);
        });
    }
  }

  onLocationListener(event: any) {
    if (event) {
      (this.controls['locations'] as UntypedFormControl).patchValue(
        event.formatted_address
      );
      (this.controls['lng'] as UntypedFormControl).patchValue(event.latLng.lng);
      (this.controls['lat'] as UntypedFormControl).patchValue(event.latLng.lat);
    }
  }

  onSubmit() {
    let model = this.userForm.value;
    this.number = model.phoneNumber;
    if (this.selectedUser) {
      this.userForm.removeControl('phoneNumber');
      delete model.phoneNumber;
    }
    if (this.userForm.invalid) return;
    let prefixCode = this.code.value;
    if (!this.selectedUser) {
      let phoneCountry: CountryCode = this.codes.find(
        (e: CountryCode) => e.prefixCode == prefixCode
      )!;
      if (this.number.startsWith('0')) {
        this.number = this.number.substring(1);
      }

      if (!model.phoneNumber.startsWith(phoneCountry.prefixCode)) {
        model.phoneNumber = phoneCountry.prefixCode + this.number;
      }
    }

    if (model.isActive == null) {
      model.isActive = false;
    }
    model.securityCompanyId = this.auth.snapshot.userInfo?.id;
    model.securityCompanyBranchId = this.branch.id;
    console.log(model);
    this.addModel=model;
    if (this.selectedUser) {
      model.id = this.selectedUser.id;
      this.edit(model);
      this.selectedUser = null;
    } else {
      let numOfUsers = this.PackagesService.myPackage.getValue().numOfUsers;
      if (this.users.length < numOfUsers) {
        this.add(model);
      } else {
        this.modal.open(this.modalId3);
      }
    }
  }

  onAdd() {
    this.addMode=true;
    this.selectedUser = null;
    this.form.resetForm();
    this.photoLink = null;
    this.canvas.open(this.canvasId);
  }

  onEdit(user: any) {
    this.selectedUser = user;
    console.log(user);
    this.securityCompanyUserClient=user.securityCompanyUserClient;
    this.photoLink = user.photo.fullLink;
    let _user = { ...user };
    this.addMode=false;
    this.userForm.patchValue(user);
    this.canvas.open(this.canvasId);
  }

  onDelete(user: CompanyUser) {
    this.selectedUser = user;
    this.modal.open(this.modalId);
  }

  add(model: any) {
    this.getAllSecurityCompaniesClients();
    this.canvas.close(this.canvasId);
    this.canvas.open(this.addClients)
    // this.usersServices.add(model).subscribe(() => {
    //   this.getUsers();
    //   this.canvas.close(this.canvasId);
    //   this.resetFrom();
    // });
  }

  edit(model: any) {
    model.appUserId = this.selectedUser.appUserId;
    this.userForm.addControl(
      'phoneNumber',
      this.fb.control(this.number, [Validators.required])
    );
    model.phoneNumber = this.userForm.controls['phoneNumber'].value;
    this.usersServices.edit(model).subscribe((res) => {
      if (res) {
        this.getUsers();
        this.canvas.close(this.canvasId);
      }
    });
  }

  getUsers() {
    this.usersServices.getAllByBranchId(this.branch.id).subscribe((users) => {
      this.users = users;
    });
  }

  toggleState(user: CompanyUser, event: any) {
    this.usersServices.edit(user).subscribe(() => this.getUsers());
  }

  resetFrom() {
    this.photoLink = null;
    this.form.resetForm();
    this.canvas.close(this.canvasId);
  }

  delete() {
    this.usersServices
      .delete(this.selectedUser.id)
      .subscribe(() => this.getUsers());
  }

  getAllSecurityCompaniesClients(){
    this._branch.getAllNamesforClientCompanies(this.branch.securityCompanyId).subscribe((res)=>{
      console.log(res);
     this.clientCompanies=res;
     this.clientCompanies.forEach((item:any) => item.isSelected = false);
     console.log(this.clientCompanies);
     
    })
  }

  addClientByUserId(id:string){
    this.addMode=false
    this. getAllSecurityCompaniesClients();
      this.userID=id;
      this.canvas.open(this.addClients)
  }

  addClientUser(){
   // this.userID=id;
    this.canvas.open(this.addClients)
  }
  selectedCompanies: any[] = [];
  submitSelection() {
    if(this.addMode==true){
      this.selectedCompanies=[]
      console.log(this.addMode);
    this.clientCompanies=this.clientCompanies.filter((company:any) => company.isSelected)
    this.clientCompanies.forEach((ele:any)=>{
      this.selectedCompanies.push({
        //"securityCompanyUserId":this.userID,
      "securityCompanyClientId":ele.id
      })
      console.log(this.selectedCompanies);
    })
    console.log(this.selectedCompanies);
    this.addModel.securityCompanyUserClient=this.selectedCompanies;
    console.log(this.addModel);
     this.usersServices.add(this.addModel).subscribe((res) => {
      this.getUsers();
      this.canvas.close(this.addClients);
      this.resetFrom();
    },
    (error)=>{
      this.getUsers();
      this.canvas.close(this.addClients);
      this.resetFrom();
    }
    );

  }else if(this.addMode==false){
    this.selectedCompanies=[]
    console.log(this.addMode);
    
    this.clientCompanies=this.clientCompanies.filter((company:any) => company.isSelected)
    this.clientCompanies.forEach((ele:any)=>{
      this.selectedCompanies.push({
      "securityCompanyUserId":this.userID,
      "securityCompanyClientId":ele.id
      })
      console.log(this.selectedCompanies);
    })
    this.selectedCompanies.forEach((ele)=>{
    this._branch.addClientToUser(ele).subscribe((res)=>{
    console.log(res);
    this.canvas.close(this.addClients)
    this.getAllSecurityCompaniesClients();
    this.getUsers();
   })
})
}
}

onDeleteClient(clientCompany:any){
console.log(clientCompany);
this.clientCompany=clientCompany;
this.modal.open(this.deleteModalId);
}

deleteClient(){
  this._branch.DeleteClientUser(this.clientCompany.id).subscribe((res)=>{
    this.canvas.close(this.canvasId);
    this.modal.close(this.deleteModalId);
    this.getUsers();
  })
}
}
