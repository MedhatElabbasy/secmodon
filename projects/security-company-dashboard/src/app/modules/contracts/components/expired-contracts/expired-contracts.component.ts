import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { LangService, PAGINATION_SIZES, Pagination } from 'projects/tools/src/public-api';
import { ContractsService } from '../../services/contracts.service';
import { Contract } from '../../models/contracts';

@Component({
  selector: 'app-expired-contracts',
  templateUrl: './expired-contracts.component.html',
  styleUrls: ['./expired-contracts.component.scss']
})
export class ExpiredContractsComponent implements OnInit {
  pageNumber = 1;
  pageSize = 5;
  sizes = [...PAGINATION_SIZES];
  contracts!: Pagination<Contract>;
  searchKey = '';
  constructor(private route: ActivatedRoute,
    public lang: LangService,
    private contractService: ContractsService) { }

  ngOnInit() {
    this.contractService.inAdditional.next(false)
    this.getInitData();
  }

  onPageSizeChange(event: any) {
    this.pageSize = event.target.value;
    this.getContracts();
  }

  onPageNumberChange(event: number) {
    this.pageNumber = event;
    this.getContracts();
  }

  getInitData() {
    this.route.data.subscribe((res) => {
      this.contracts = res['contracts'];
    });
  }

  getContracts() {
    this.contractService
      .getExpiredContracts(this.pageNumber, this.pageSize)
      .subscribe((res) => {
        this.contracts = res;
      });
  }
  navigate(contract: Contract) {
    if (contract.isOldContract) {
      window.open(contract.oldContractFile?.fullLink, '_blank');
    } else {
      this.contractService.isOldContract(contract.id).subscribe((res: any) => {
        if (res.documentUrl) {
          window.open(res.documentUrl, '_blank');
        }
      });
    }
  }

}
