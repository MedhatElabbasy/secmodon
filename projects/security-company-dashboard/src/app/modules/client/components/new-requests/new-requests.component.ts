import { PackagesService } from './../../../packages/services/packages.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Observable } from 'rxjs';
import {
  Branch,
  LangService,
  OptionSetEnum,
  OrderStatus,
  RequestsService,
} from 'projects/tools/src/public-api';
import { ModalService } from 'projects/tools/src/public-api';
import {
  CanvasService,
  ClientOrder,
  PAGINATION_SIZES,
} from 'projects/tools/src/public-api';
import { AuthService } from '../../../auth/services/auth.service';
import { BranchesService } from '../../../branches/services/branches.service';
import { CLIENTS_MODULE_TITLE } from '../../client.component';
import { CompanyOrdersService } from '../../services/company-orders.service';
import { FormArray, FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { OfferDetailsService } from '../../services/offer-details.service';
import { NotifyService } from '../../../core/services/notify.service';
import { Routing } from '../../../core/routes/app-routes';
import { ClientsRoutes } from '../../routes/clients-routes.enum';

@Component({
  selector: 'app-new-requests',
  templateUrl: './new-requests.component.html',
  styleUrls: ['./new-requests.component.scss'],
})
export class NewRequestsComponent implements OnInit {
  @ViewChild('form') form!: FormGroupDirective;
  pageNumber = 1;
  pageSize = 10;
  totalPrice: number = 0
  offerModel = 'offer'
  errorOperation = 'errorOperation';
  selected: boolean = false
  total!: number;
  offerDetails!: any
  sizes = [...PAGINATION_SIZES];
  requests!: ClientOrder[];
  canvasId = 'request-details';
  selectedRequest!: ClientOrder;
  branches!: Branch[];
  offerRequest!: FormGroup;
  approveModal = 'approve-order-modal';
  rejectModal = 'reject-order-modal';
  canvasOffer = 'canvasOffer'
  negotiationCanvas = 'negotiation'
  selectedBranch: Branch | null = null;
  isAr!: Observable<boolean>;
  mainBranchId!: string;
  offerId!: string
  searchKey = '';
  update: boolean = false
  messages!: any
  updateNegotiation = 'updateNegotiation'
  messageLength: number = 0
  Reason: FormGroup = this.fb.group({
    reason: ['', [Validators.required]],
  });
  ids: any[] = []
  companyName!: string
  clientPriceOffersId: any[] = []
  messageForm: FormGroup = this.fb.group({
    clientPriceOffersId: '',
    securityCompanyBranchId: '',
    securityCompanyId: null,
    clientCompanyId: null,
    message: ['', [Validators.required]],
    messageFrom: 0
  });
  constructor(
    public canvasService: CanvasService,
    private route: ActivatedRoute,
    private modal: ModalService,
    public lang: LangService,
    private router: Router,
    private orderServices: CompanyOrdersService,
    private branchesServices: BranchesService,
    private requestService: RequestsService,
    private auth: AuthService,
    private offerService: OfferDetailsService,
    private PackagesService: PackagesService,
    private fb: FormBuilder,
    private notify: NotifyService
  ) {
    this.isAr = this.lang.isAr;
    this.mainBranchId = this.auth.snapshot.userInfo?.securityCompanyBranch.id!;
    CLIENTS_MODULE_TITLE.next('clients.clients_requests');
  }

  ngOnInit(): void {
    this.companyName = this.auth.snapshot.userInfo?.name!
    this.getInitDate();

  }

  getInitDate() {
    this.route.data.subscribe((res: any) => {
      this.requests = res.orders.orders.filter(
        (e: any) => !e.isApprovedByMainBranch
      );
      this.branches = res.orders.branches;
    });
  }
  selectBranch(object: any) {
    this.selected = true
    this.offerRequest.controls['securityCompanyBranchId'].setValue(object.value)
  }
  reload() {
    let branches$ = this.branchesServices.getAllByCompanyId();
    let requests$ = this.requestService.getAllBySecurityCompany(
      this.auth.snapshot.userInfo?.id!
    );
    combineLatest([branches$, requests$]).subscribe((res: any) => {
      this.branches = res[0];

      this.requests = res[1].filter((e: any) => !e.isApprovedByMainBranch);
    });
  }

  onPageSizeChange(number: any) {
    this.pageSize = +number.target.value;
    this.reload();
  }

  onPageNumberChange(event: number) {
    this.pageNumber = event;
    this.reload();
  }
  generateForm() {
    this.offerRequest = this.fb.group({
      clientOrderId: this.selectedRequest.id,
      securityCompanyId: this.selectedRequest.securityCompany?.id,
      securityCompanyBranchId: [null, [Validators.required]],
      totalOffer: [null],
      offerPriceGuardsShifts:
        this.fb.array([])
    })
  }
  showRequestDetails(order: ClientOrder) {
    this.selectedRequest = order;
   
    this.offerDetails = [{}]
    this.getOffer(this.selectedRequest.id)
    this.generateForm()
    let i = 0;
    this.selectedRequest?.clientOrderGuardsShifts.forEach((element: any) => {

      if (this.offerRequest.controls['offerPriceGuardsShifts']?.value.length < this.selectedRequest?.clientOrderGuardsShifts?.length) {
        this.addGuard(i)
        i++;
      }
    });
  }

  addGuard(index: number) {
    let guard = this.fb.group({
      clientOrderGuardsShiftsId: this.selectedRequest?.clientOrderGuardsShifts[index]?.id,
      price: [null, [Validators.required, Validators.min(1)]],
      total: [null, [Validators.required]],
    })
    this.offerPriceGuardsShifts.push(guard);
  }
  get offerPriceGuardsShifts(): FormArray {
    return this.offerRequest?.get('offerPriceGuardsShifts') as FormArray;
  }
  totalForm(event: any, index: number) {

    let numberOfGuards = this.selectedRequest?.clientOrderGuardsShifts[index].number
    let total = Number(event.target.value) * Number(numberOfGuards)
    this.offerPriceGuardsShifts.at(index).get('total')?.setValue(total)
    this.totalPrice = 0
    this.offerPriceGuardsShifts.value.forEach((element: any) => {
      if (element.total) {
        this.totalPrice += element.total
      }
    })
    this.offerRequest.controls['totalOffer'].setValue(this.totalPrice)
  }
  addRequest() {
    if (this.offerRequest.invalid) return;
    this.offerService.sendOffer(this.offerRequest.value).subscribe((res: any) => {
      if (res?.id) {
        this.canvasService.close(this.canvasOffer);
        let notification = {
          titile: "تم تقديم عرض سعر لطلبك",
          titileEn: "A quote has been submitted for your request",
          description: ` برجاء مراجعة طلباتك لشركه ${this.companyName}`,
          descriptionEn: `Please review your requests by ${this.companyName}`,
          appUserId: this.auth.snapshot.userInfo?.appUserId,
          clientCompanyId: this.selectedRequest.clientCompany?.id,
        }
        this.notify.addNotify(notification).subscribe((res) => {
        })
        this.totalPrice = 0
        this.selected = false
        this.totalPrice = 0
        this.modal.open(this.offerModel)
      }
    })

  }
  // onApprove() {
  //   this.modal.open(this.approveModal);
  // }
  // onReject() {
  //   this.modal.open(this.rejectModal);
  // }
  offer() {
    this.update = false
    this.totalPrice = 0
    this.canvasService.open(this.canvasOffer);
  }
  // reject(data: FormGroup) {
  //   this.orderServices
  //     .reject(this.selectedRequest.id, data.value.reason)
  //     .subscribe(() => {
  //       this.selectedBranch = null;
  //       this.modal.close(this.rejectModal);
  //       this.updateStatus(this.offerId, 3)
  //       this.canvasService.close(this.canvasId);
  //       this.orderServices
  //         .updateOrderStatus(
  //           this.selectedRequest.id,
  //           OptionSetEnum.OrderStatus,
  //           OrderStatus.rejected
  //         )
  //         .subscribe((res) => {
  //           let notification = {
  //             titile: "تم رفض طلبك",
  //             titileEn: "Your application has been rejected",
  //             description: "تم رفض طلبك من قبل شركة الأمن",
  //             descriptionEn: "Your request has been rejected by the security company",
  //             appUserId: this.auth.snapshot.userInfo?.appUserId,
  //             clientCompanyId: this.selectedRequest.clientCompany?.id,
  //           }
  //           this.notify.addNotify(notification).subscribe((res) => {
  //           })
  //           this.reload()
  //         });
  //     });
  // }
  // approve() {
  //   let ReceivingOffersFromClients =
  //     this.PackagesService.myPackage.getValue().ReceivingOffersFromClients;
  //   if (this.requests.length < ReceivingOffersFromClients) {
  //     this.orderServices
  //       .approve(
  //         this.selectedRequest.id,
  //         this.mainBranchId,
  //         this.selectedBranch?.id
  //       )
  //       .subscribe(() => {
  //         this.selectedBranch = null;
  //         this.updateStatus(this.offerId, 1)
  //         this.modal.close(this.approveModal);
  //         this.canvasService.close(this.canvasId);
  //         this.orderServices
  //           .updateOrderStatus(
  //             this.selectedRequest.id,
  //             OptionSetEnum.OrderStatus,
  //             OrderStatus.approvedByMain
  //           )
  //           .subscribe((res) => this.reload());
  //       });


  //   } else {
  //     this.modal.open(this.errorOperation);
  //   }
  // }
  close() {
    this.modal.close(this.offerModel)
  }
  getOffer(id: string) {
    this.offerService.getOffer(id).subscribe((res: any) => {
      this.offerDetails = res
    
      if (res[0]?.id) {
        if (!this.offerId) {
          this.getMessages(res[0].id)
        }
        this.offerId = res[0]?.id
        this.messageForm.controls['clientCompanyId'].setValue(`${this.selectedRequest?.clientCompany?.id}`)
        this.messageForm.controls['securityCompanyId'].setValue(this.offerDetails[0].securityCompanyId)
        this.messageForm.controls['securityCompanyBranchId'].setValue(this.offerDetails[0].securityCompanyBranchId)
        this.messageForm.controls['clientPriceOffersId'].setValue(this.offerDetails[0].id)

      }
      this.canvasService.open(this.canvasId);
    })
  }
  negotiation() {
    this.canvasService.open(this.negotiationCanvas)
  }
  sendMessage(formMessage: FormGroup) {
    if (formMessage.invalid) return;
    this.offerService.sendMessage(formMessage.value).subscribe((res: any) => {
      let notification = {
        titile: "تم إرسال رسالة في المفاوضة من قبل شركة الأمن",
        titileEn: "A message was sent in the negotiation by the security company",
        description: `تم إرسال رسالة في المفاوضة من قبل شركة ${this.companyName}`,
        descriptionEn: `A message was sent in the negotiation by ${this.companyName} company`,
        appUserId: this.auth.snapshot.userInfo?.appUserId,
        clientCompanyId: this.selectedRequest.clientCompany?.id,
      }
      this.notify.addNotify(notification).subscribe((res) => {
      })
      this.messageForm.controls['message'].reset();
      this.getMessages(this.offerId)
    })
  }
  getMessages(id: string) {
    this.offerService.getMessages(id).subscribe((res) => {
      this.messages = res
      this.messageLength = this.messages.length
    
    })
  }
  EndNegotiation() {
    this.update = true
    this.canvasService.open(this.canvasOffer)
    this.offerRequest.patchValue(this.offerDetails[0])
    let offers = this.offerDetails[0].offerPriceGuardsShifts

    offers.forEach((element: any) => {
      this.ids.push(element.id)
      this.clientPriceOffersId.push(element.clientPriceOffersId)
    })

  }
  // updateRequest() {
  //   if (this.offerRequest.invalid) return;
  //   let model = this.offerRequest.value
  //   model.id = this.offerDetails[0].id
  //   let offers = model.offerPriceGuardsShifts

  //   let i = 0
  //   offers.forEach((element: any) => {
  //     element.id = this.ids[i]
  //     element.clientPriceOffersId = this.clientPriceOffersId[i]
  //     i++
  //   })
  //   this.offerService.update(model).subscribe((res) => {
  //     let notification = {
  //       titile: "تم تعديل عرض السعر من قبل شركة الأمن",
  //       titileEn: "The price offer has been updated by the security company",
  //       description: "تم تعديل عرض السعر من قبل شركة الأمن",
  //       descriptionEn: "The price offer has been updated by the security company",
  //       appUserId: this.auth.snapshot.userInfo?.appUserId,
  //       clientCompanyId: this.selectedRequest.clientCompany?.id,
  //     }
  //     this.notify.addNotify(notification).subscribe((res) => {
  //     })
  //     this.updateStatus(this.offerId, 6)
  //   })
  // }

  updateStatus(id: string, value: number) {
    this.offerService.updateStatus(id, value).subscribe((res) => {
      if (value == 6) {
        this.getOffer(this.selectedRequest.id)
        this.modal.open(this.updateNegotiation)
      }
    })
  }
  closeUpdate() {
    this.modal.close(this.updateNegotiation)
    this.modal.close(this.offerModel)
  }
  showOffer(details: any) {

    this.router.navigate([`/${Routing.dashboard}/${Routing.clients.module}/${ClientsRoutes.offerDetails}/${details[0].clientOrderId}`]);
  }
}
