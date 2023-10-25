import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClientsService } from '../../../../services/clients.service';
import { LangService } from 'projects/tools/src/public-api';
import { CanvasService, ModalService } from 'projects/tools/src/public-api';
import { ClientSiteService } from '../../../../services/client-site.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-connect-branches',
  templateUrl: './connect-branches.component.html',
  styleUrls: ['./connect-branches.component.scss'],
})
export class ConnectBranchesComponent implements OnInit {
  securityCompanyClientId!: string;
  clintId!: number;
  branches: any[] = [];
  searchKey = '';
  allBranches!: any;
  selectedBranch!: any;
  securityBranch: string = '';
  canvasId = 'updateConnection';
  form!: FormGroup;
  model = 'model';
  submitted: boolean = false;
  type!: string
  id!: string
  constructor(
    private route: ActivatedRoute,
    private ClientsService: ClientsService,
    public lang: LangService,
    public canvas: CanvasService,
    private fb: FormBuilder,
    public siteServices: ClientSiteService,
    public modal: ModalService
  ) {
    this.generateForm();
    this.route.data.subscribe((res) => {

      let details = res['details']
      if (details) {
        this.ClientsService.getClientBranches(details.id).subscribe(
          (res2: any) => {
            this.branches = res2;
          }
        );
      }
    });

    this.siteServices.allBranches().subscribe((res) => {
      this.allBranches = res;
    });
  }
  generateForm() {
    this.form = this.fb.group({
      clientCompanyBranchId: [null, [Validators.required]],
      securityCompanyBranchId: [null, [Validators.required]],
    });
  }
  ngOnInit(): void { }
  action(branch: any, type: string) {
    this.type = type
    this.id = branch.id
    this.submitted = false;
    if (branch.securityCompanyBranchId) {
      this.form.controls['securityCompanyBranchId'].setValue(
        branch.securityCompanyBranchId
      );
    }
    this.form.controls['clientCompanyBranchId'].setValue(branch.clientCompanyBranchId);

    this.canvas.open(this.canvasId);
  }
  onSubmit() {
    this.submitted = true;
    if (this.form.invalid) return;
    let data = this.form.value
    data.securityCompanyClientId = this.securityCompanyClientId
    if (this.type == 'update') {
      data.id = this.id
      this.ClientsService.updateBranchData(data).subscribe((res) => {
        if (res) {
          this.canvas.close(this.canvasId);
          this.form.reset();
          this.modal.open(this.model);
          this.ClientsService.getClientBranches(this.securityCompanyClientId).subscribe(
            (res2: any) => {
              this.branches = res2;
            }
          );
        }
      });
    }
    else {
      this.ClientsService.addBranchData(data).subscribe((res) => {
        if (res) {
          this.canvas.close(this.canvasId);
          this.form.reset();
          this.modal.open(this.model);
          this.ClientsService.getClientBranches(this.securityCompanyClientId).subscribe(
            (res2: any) => {
              this.branches = res2;
            }
          );
        }
      });
    }
  }

}
