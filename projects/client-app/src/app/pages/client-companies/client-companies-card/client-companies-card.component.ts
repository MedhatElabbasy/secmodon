import { Component, Input, OnInit } from '@angular/core';
import { ClientCompany } from '../../../modules/auth/models/client-company.model';

@Component({
  selector: 'app-client-companies-card',
  templateUrl: './client-companies-card.component.html',
  styleUrls: ['./client-companies-card.component.scss']
})
export class ClientCompaniesCardComponent implements OnInit {
  @Input('data') data!: ClientCompany
  constructor() { }

  ngOnInit(): void {
  }

}
