import { Lookup } from './../../../../../../../tools/src/lib/models/lookup';
import { ActivatedRoute } from '@angular/router';
import { CustomValidators } from './../../../../../../../tools/src/lib/validators/custom-validators.class';
import { FormGroup, FormBuilder, Validators, UntypedFormControl, FormControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  AcceptedFile,
  AcceptedImage,
  AttachmentService,
  CanvasService,
  City,
  LangService,
  LookupService,
  SecurityCompany,
} from 'projects/tools/src/public-api';
import { AuthService } from '../../../auth/services/auth.service';
import { AccountService } from '../../services/account.service';
import { log } from 'console';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit {
  editPersonCanvas = 'edit-person-canvas';
  editBankData = 'editBankDataCanvas';
  bankForm!: FormGroup;
  idProofUrl!: string | null;
  docLink!: boolean;
  url!: string | null;
  avalibleServicesCanvas = 'edit-avaliable-services';
  descriptionCanvas = 'description-links';
  company!: SecurityCompany;
  isAr!: BehaviorSubject<boolean>;
  personForm!: FormGroup;
  //avaliableServicesForm!: FormGroup;
  acceptedFiles = [...AcceptedImage];
  businessTypes!: Lookup[];
  cities!: City[];
  areas!: Lookup[];
  imagePath: string | null = '';
  jobs!: any;
  avaliableServicesForm!: FormGroup;
  DescriptionForm!: FormGroup;
  avaliableService: any;
  companyID!: any;
  errorMessage = false
  remainJobs!: Lookup[];
  photoCanvas = 'photocanvas'
  profileImage!: string | null;
  photoForm!: FormGroup;
  date!: Date
  image!: string | null
  constructor(
    private auth: AuthService,
    public lang: LangService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private canvas: CanvasService,
    private lookups: LookupService,
    private attachment: AttachmentService,
    private accountServices: AccountService
  ) {

    this.isAr = this.lang.isAr;
   

    this.auth.userInfo.subscribe((res) => {
      this.company = res!;
   

    });
    this.generatePersonForm();
    this.generateServicesForm();
    this.generateBankForm()
    this.generateDescriptionForm();
    this.generateUserForm();
  }

  ngOnInit() {
    this.date = new Date()
    this.route.data.subscribe((res) => {
      this.businessTypes = res['initData'].businessTypes;
      this.cities = res['initData'].cities;
    });

    this.lookups.getAreas(this.company.cityId.toString()).subscribe((res) => {
      this.areas = res;
    });
    this.getAllServices();
  }

  public get personControls(): any {
    return this.personForm.controls;
  }
  get controls(): any {
    return this.photoForm.controls;
  }


  public get servicesControls(): any {
    return this.avaliableServicesForm.controls;
  }

  public get descriptionControls(): any {
    return this.DescriptionForm.controls;
  }

  generatePersonForm() {
    this.personForm = this.fb.group({
      firstName: [null, [Validators.required]],
      lastName: [null, [Validators.required]],
      email: [null, [Validators.required, Validators.email]],
      businessTypeId: [null, Validators.required],
      address: [null, Validators.required],
      locationLat: [null, Validators.required],
      locationLng: [null, Validators.required],
      companyContactNumber: [null, Validators.required],
    });
  }


  generateServicesForm() {
    this.avaliableServicesForm = this.fb.group({
      job: [null, Validators.required]
    })
  }

  generateDescriptionForm() {
    this.DescriptionForm = this.fb.group({
      businessDescription: [null, Validators.required],
      businessDescriptionEn: [null, Validators.required],
      socialMediaLink2: [null, Validators.required],
      socialMediaLink: [null, Validators.required],
      website: [null, Validators.required],
      commercialRegisterNumber: [null, [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      licenseNumber: [
        null,
        [Validators.required, Validators.pattern(/^[0-9]{10}$/)],
      ],
      licenseEndDate: [null, [Validators.required]],
      licenseImageId: [null, Validators.required],
    })
  }

  editPersonProfile() {
    this.personForm.patchValue(this.company);

    this.imagePath = this.company?.profileImage?.fullLink;
    this.personForm.controls['address'].setValue(null)
    this.personForm.controls['companyContactNumber'].setValue(this.company.companyContactNumber)

    this.canvas.open(this.editPersonCanvas);
  }

  /* getArea() {
     this.lookups
       .getAreas(this.personControls['cityId'].value)
       .subscribe((res) => (this.areas = res));
   }
 */
  updatePersonalInfo() {

    if (this.personForm.invalid) return;

    let model: any = this.personForm.value;

    delete model.locationLat
    delete model.locationLng

    this.accountServices.updateUserInfo(model, this.company.id).subscribe((res: any) => {
      if (res.id) {
        this.canvas.close(this.editPersonCanvas);
        this.auth.userInfo.next(res)
        this.auth.userInfo.subscribe((res) => {
          this.company = res!;
        });
      }
    })

  }

  getAllServices() {
    this.lookups.getAllAvailableServices().subscribe((job) => {
      this.jobs = job;
     
      this.company.securitCompanyAvailableServices.forEach((x) => {
        this.jobs = this.jobs.filter((y: any) => {
          return y.id != x.availableServicesId;
        })
      })

    })
  }
  editAvaliableServicesProfile() {
    this.canvas.open(this.avalibleServicesCanvas);
  }


  editAvaliableServices() {
    this.companyID = this.company.id;
    this.avaliableService = this.avaliableServicesForm.controls['job'].value;
 
    if (this.avaliableServicesForm.invalid) return
    let model = {
      "securityCompanyId": this.companyID,
      "availableServicesId": this.avaliableService
    }

    this.accountServices.addAvaliableService(model).subscribe((res: any) => {
      if (res) {
        this.canvas.close(this.avalibleServicesCanvas);
        this.auth.userInfo.next(res)
        this.auth.userInfo.subscribe((res) => {
          this.company = res!;
        });
        this.getAllServices();
        this.avaliableServicesForm.reset();
      }
    })
  }

  deleteAvaliableServices(service: any) {
   
    this.accountServices.deleteAllServices(service.id).subscribe((res: any) => {
     
      this.company.securitCompanyAvailableServices = this.company.securitCompanyAvailableServices.filter((x) => {
        return x != service
      })
    });
  }

  editDescriptionAndLinksProfile() {
    this.canvas.open(this.descriptionCanvas)
    this.DescriptionForm.patchValue(this.company)
    // this.DescriptionForm.controls['businessDescription'].setValue(this.company.businessDescription);
    // this.DescriptionForm.controls['website'].setValue(this.company.website);
    // this.DescriptionForm.controls['socialMediaLink'].setValue(this.company.socialMediaLink);
    // this.DescriptionForm.controls['socialMediaLink2'].setValue(this.company.socialMediaLink2);
    // this.DescriptionForm.controls['businessDescriptionEn'].setValue(this.company.overviewEn);
  }
  editDescritionAndLinks() {
    if (this.DescriptionForm.invalid) return

    let model = {
      "businessDescription": this.DescriptionForm.controls['businessDescription'].value,
      "website": this.DescriptionForm.controls['website'].value,
      "socialMediaLink": this.DescriptionForm.controls['socialMediaLink'].value,
      "socialMediaLink2": this.DescriptionForm.controls['socialMediaLink2'].value
    }

    let modal = {
      "id": this.company.id,
      "overview": this.DescriptionForm.controls['businessDescription'].value,
      "overviewEn": this.DescriptionForm.controls['businessDescriptionEn'].value,
      // "commercialRegisterNumber": this.DescriptionForm.controls['commercialRegisterNumber'].value,
      // "licenseNumber": this.DescriptionForm.controls['licenseNumber'].value,
      // "licenseEndDate": this.DescriptionForm.controls['licenseEndDate'].value,

    }

    this.accountServices.updateDescritionAndLinks(this.company.id, model).subscribe((res: any) => {
      if (res != null) {
        this.canvas.close(this.descriptionCanvas);
       
        // this.auth.userInfo.next(res)
        // this.auth.userInfo.subscribe((res:any) => {
        //   this.company = res;
        //    //window.location.reload(); 
        // });
        this.accountServices.updateOverView(modal).subscribe((res: any) => {
     
          if (res) {
            this.auth.userInfo.next(res)
            this.auth.userInfo.subscribe((res: any) => {

              this.company = res;
         


            });
          }
        })
        this.DescriptionForm.reset();
      }
    })


  }


  editBankDetails() {
    this.bankForm.patchValue(this.company);
    this.idProofUrl = this.company?.idProof?.fullLink;
    this.canvas.open(this.editBankData);
  }
  generateBankForm() {
    this.bankForm = this.fb.group({
      idProofId: [null, [Validators.required]],
      bankName: [null, [Validators.required]],
      accountHolderName: [null, [Validators.required]],
      accountName: [null, Validators.required],
      iban: [null, [Validators.required, Validators.pattern(/^SA\d{4}[0-9A-Z]{18}$/)]],
    });
  }
  public get bankControls(): any {
    return this.bankForm.controls;
  }

  onUpload(event: any) {
    let arr = event.target.files[0].name.split('.');
    const extension = arr[arr.length - 1].toLowerCase();

    if (!AcceptedFile.includes(extension)) {
      (this.bankControls['idProofId'] as UntypedFormControl).setErrors({
        notValid: true,
      });
      this.idProofUrl = null;
      return;
    } else {
      const files = ['pdf', 'doc', 'docx'];

      if (files.includes(extension)) {
        this.docLink = true;
      } else {
        this.url = URL.createObjectURL(event.target.files[0]);
      }

      (this.bankControls['idProofId'] as UntypedFormControl).setErrors({
        notValid: null,
      });

      this.attachment
        .uploadFile(event.target.files[0].name, event.target.files[0])
        .subscribe((res) => {
        
          if (this.url != null) {
            this.idProofUrl = this.url;
          }
          this.bankControls['idProofId'].setValue(res);
        });
    }
  }
  updateBankInfo() {
    if (this.bankForm.invalid) return;

    let model: any = this.bankForm.value;


    this.accountServices.updateBankInfo(model, this.company.id).subscribe((res: any) => {
      if (res.id) {
        this.canvas.close(this.editBankData);
        this.auth.userInfo.next(res)
        this.auth.userInfo.subscribe((res) => {
          this.company = res!;
        });
      }
    })
  }


  updatePhoto() {
    this.canvas.open(this.photoCanvas);
    this.profileImage = this.company.companyLogo?.fullLink;
    this.photoForm.controls['photoId'].setValue(this.company.companyLogo?.id);
  }

  generateUserForm() {
    this.photoForm = this.fb.group({
      photoId: [null, [Validators.required]]
    })
  }


  onImageUpload(event: any) {
    let arr = event?.target?.files[0]?.name.split('.');
    const extension = arr[arr.length - 1].toLowerCase();

    if (!AcceptedImage.includes(extension)) {
      (this.controls['photoId'] as FormControl).setErrors({
        notValid: true,
      });
      this.profileImage = null;
      return;
    } else {
      let url = URL.createObjectURL(event.target.files[0]);

      (this.controls['photoId'] as FormControl).setErrors({
        notValid: null,
      });

      this.attachment
        .uploadFile(event.target.files[0].name, event.target.files[0])
        .subscribe((res) => {
          this.profileImage = url;
          this.controls['photoId'].setValue(res);

        });
    }
  }

  photo(photo: any) {

    this.accountServices.updatePhoto(this.photoForm.controls['photoId'].value, this.company.id).subscribe((res: any) => {
  
      this.canvas.close(this.photoCanvas);
      this.auth.userInfo.next(res);
      this.auth.userInfo.subscribe((res) => {
        this.company = res!;


      });
    })

  }
}
