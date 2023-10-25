import { Component, OnInit } from '@angular/core';
import { ReportsService } from '../../../../services/reports.service';

@Component({
  selector: 'app-fact-attachment',
  templateUrl: './fact-attachment.component.html',
  styleUrls: ['./fact-attachment.component.scss']
})
export class FactAttachmentComponent implements OnInit {
  display: boolean = false;
  selectedGallery!: any[];
  constructor(private _ReportsService: ReportsService) { }
  dailyFactsDetails: any;
  ngOnInit(): void {
    this._ReportsService.dailyFactsDetails.subscribe((res) => {
      this.dailyFactsDetails = res
      console.log(this.dailyFactsDetails);
    })


  }

  openGallery(gallery: any[]) {
    this.selectedGallery = gallery;
    this.display = true;
  }

}
