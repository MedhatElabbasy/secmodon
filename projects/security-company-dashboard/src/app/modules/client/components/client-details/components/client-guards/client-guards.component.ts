import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Routing } from 'projects/security-company-dashboard/src/app/modules/core/routes/app-routes';
import { ClientSite } from '../../../../models/client-site';

@Component({
  selector: 'app-client-guards',
  templateUrl: './client-guards.component.html',
  styleUrls: ['./client-guards.component.scss'],
})
export class ClientGuardsComponent implements OnInit {
  sites!: ClientSite[];
  searchKey = '';
  allData!:any[];
  locationLink = `/${Routing.dashboard}/${Routing.clients.module}/${Routing.clients.children.clientDetails}/${this.route.parent?.snapshot.params['id']}/${this.route.parent?.snapshot.params['clientId']}/${Routing.clients.children.guards}/${Routing.clients.children.locationGuards}`;
  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.data.subscribe((res) => {
      this.sites = res['sites'];
      this.allData=res['sites'];
    });
  }
  getLocationOfSite(event: any) {}
  // siteId(id: string) {
  //   console.log(id);

  //   localStorage.setItem('siteId', id);
  // }

  search() {
    // console.log(this.allData);
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
      this.sites = this.allData;
    }
  }
}
