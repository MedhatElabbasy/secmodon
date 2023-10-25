import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LangService } from 'projects/tools/src/public-api';
import { combineLatest } from 'rxjs';
import { Branch, ClientOrder, OptionSetEnum, OrderStatus, RequestsService } from 'projects/tools/src/public-api';
import { ModalService, CanvasService } from 'projects/tools/src/public-api';
import { AuthService } from '../../../auth/services/auth.service';
import { BranchesService } from '../../../branches/services/branches.service';
import { NotifyService } from '../../../core/services/notify.service';
import { PackagesService } from '../../../packages/services/packages.service';
import { CLIENTS_MODULE_TITLE } from '../../client.component';
import { CompanyOrdersService } from '../../services/company-orders.service';
import { OfferDetailsService } from '../../services/offer-details.service';

@Component({
  selector: 'app-offer-details',
  templateUrl: './offer-details.component.html',
  styleUrls: ['./offer-details.component.scss']
})
export class OfferDetailsComponent implements OnInit {

  constructor(
    private offerService: OfferDetailsService,
    private route: ActivatedRoute,
    public lang: LangService,
    private requestService: RequestsService,
    private modal: ModalService,
    private PackagesService: PackagesService,
    private branchesServices: BranchesService,
    private auth: AuthService,
    private notify: NotifyService,
    private canvasService: CanvasService,
    private orderServices: CompanyOrdersService,
    private fb: FormBuilder
  ) { }
  data!: any
  approveModal = 'approveModal'
  negotiationCanvas = 'negotiationCanvas'
  rejectModal = 'rejectModal'
  messages: any = null

  canvasOffer = 'canvasOffer'
  updateNegotiation = 'updateNegotiation'
  offerRequest!: FormGroup;
  messageLength: number = 0
  selectedBranch: Branch | null = null;
  mainBranchId!: string;
  requests!: ClientOrder[]
  totalPrice: number = 0
  Reason: FormGroup = this.fb.group({
    reason: ['', [Validators.required]],
  });
  orderId!: string
  selectedRequest!: ClientOrder
  clientId!: string
  selected: boolean = false
  offerId!: string
  errorOperation = 'errorOperation'
  branches!: Branch[];
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
  ngOnInit(): void {
    this.mainBranchId = this.auth.snapshot.userInfo?.securityCompanyBranch.id!;
    CLIENTS_MODULE_TITLE.next('clients.clients_requests');
    this.getOffer()

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
  getOffer() {
    this.route.data.subscribe((res) => {
      this.getInitDate()
      this.data = res['data']
      this.orderId = this.data[0].clientOrderId
      this.offerId = this.data[0].id
      this.clientId = this.data[0].clientOrder.clientCompany.id
      this.selectedRequest = this.data[0].clientOrder
      this.companyName = this.auth.snapshot.userInfo?.name!
     
      this.getMessages(this.offerId)
    })
  }
  getNewOffer() {
    this.offerService.getOffer(this.orderId).subscribe((res: any) => {
      this.data = res
      this.offerId = this.data[0].id
      this.clientId = this.data[0].clientOrder.clientCompany.id


      this.selectedRequest = this.data[0].clientOrder
      this.getMessages(this.offerId)
    })
  }
  getInitDate() {
    this.branchesServices.getAllByCompanyId().subscribe((res: any) => {
      this.branches = res
  
    });
    this.requestService.getAllBySecurityCompany(
      this.auth.snapshot.userInfo?.id!
    ).subscribe((res) => {
      this.requests = res
    });
  }
  onApprove() {
    this.modal.open(this.approveModal);
  }
  selectBranch(object: any) {
    this.selected = true
    this.offerRequest.controls['securityCompanyBranchId'].setValue(object.value)
  }
  approve() {
    let ReceivingOffersFromClients =
      this.PackagesService.myPackage.getValue().ReceivingOffersFromClients;
    if (this.requests.length < ReceivingOffersFromClients) {
      this.orderServices
        .approve(
          this.orderId,
          this.mainBranchId,
          this.selectedBranch?.id
        )
        .subscribe(() => {
          this.selectedBranch = null;
          this.updateStatus(this.offerId, 1)
          this.modal.close(this.approveModal);
          this.orderServices
            .updateOrderStatus(
              this.orderId,
              OptionSetEnum.OrderStatus,
              OrderStatus.approvedByMain
            )
            .subscribe();
        });
    } else {
      this.modal.open(this.errorOperation);
    }
  }
  updateStatus(id: string, value: number) {
    this.offerService.updateStatus(id, value).subscribe((res) => {
      this.getNewOffer()
      if (value == 6) {
        this.modal.open(this.updateNegotiation)
      }
    })
  }
  onReject() {
    this.modal.open(this.rejectModal);
  }
  reject(data: FormGroup) {
    let id = this.orderId
    this.orderServices
      .reject(this.orderId, data.value.reason)
      .subscribe(() => {
        this.selectedBranch = null;
        this.modal.close(this.rejectModal);
        this.updateStatus(this.offerId, 3)

        this.orderServices
          .updateOrderStatus(
            this.orderId,
            OptionSetEnum.OrderStatus,
            OrderStatus.rejected
          )
          .subscribe((res) => {
            let notification = {
              titile: "تم رفض طلبك",
              titileEn: "Your application has been rejected",
              description: ` تم رفض طلبك من قبل شركة ${this.companyName}`,
              descriptionEn: `Your request has been rejected by ${this.companyName} company`,
              appUserId: this.auth.snapshot.userInfo?.appUserId,
              clientCompanyId: this.clientId,
            }
            this.notify.addNotify(notification).subscribe((res) => {
            })

          });
      });
  }
  negotiation() {
    this.canvasService.open(this.negotiationCanvas)

    this.messageForm.controls['clientCompanyId'].setValue(`${this.clientId}`)
    this.messageForm.controls['securityCompanyId'].setValue(this.data[0].securityCompanyId)
    this.messageForm.controls['securityCompanyBranchId'].setValue(this.data[0].securityCompanyBranchId)
    this.messageForm.controls['clientPriceOffersId'].setValue(this.data[0].id)
  }
  getMessages(id: string) {
    this.offerService.getMessages(id).subscribe((res) => {
      this.messages = res


      this.messageLength = this.messages.length
    })
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
        clientCompanyId: this.clientId,
      }
      this.notify.addNotify(notification).subscribe((res) => {
      })
      this.messageForm.controls['message'].reset();
      this.getMessages(this.offerId)
    })
  }

  EndNegotiation() {
    this.totalPrice = 0
    this.generateForm()
    let i = 0;

    this.selectedRequest?.clientOrderGuardsShifts.forEach((element: any) => {
      if (this.offerRequest.controls['offerPriceGuardsShifts']?.value.length < this.selectedRequest?.clientOrderGuardsShifts?.length) {
        this.addGuard(i)
        i++;
      }
    });
    this.canvasService.open(this.canvasOffer)
    this.offerRequest.patchValue(this.data[0])
    let offers = this.data[0].offerPriceGuardsShifts

    offers.forEach((element: any) => {
      this.ids.push(element.id)
      this.clientPriceOffersId.push(element.clientPriceOffersId)
    })
   

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
  updateRequest() {
    if (this.offerRequest.invalid) return;
    let model = this.offerRequest.value
    model.id = this.data[0].id
    let offers = model.offerPriceGuardsShifts

    let i = 0
    offers.forEach((element: any) => {
      element.id = this.ids[i]
      element.clientPriceOffersId = this.clientPriceOffersId[i]
      i++
    })
    this.offerService.update(model).subscribe((res) => {
      let notification = {
        titile: "تم تعديل عرض السعر من قبل شركة الأمن",
        titileEn: "The price offer has been updated by the security company",
        description: `تم تعديل عرض السعر من قبل شركة ${this.companyName}`,
        descriptionEn: `The price offer has been updated by ${this.companyName} company`,
        appUserId: this.auth.snapshot.userInfo?.appUserId,
        clientCompanyId: this.selectedRequest.clientCompany?.id,
      }
      this.notify.addNotify(notification).subscribe((res) => {
      })
      this.updateStatus(this.offerId, 6)
    })
  }
  closeUpdate() {
    this.modal.close(this.updateNegotiation)
  }
}
