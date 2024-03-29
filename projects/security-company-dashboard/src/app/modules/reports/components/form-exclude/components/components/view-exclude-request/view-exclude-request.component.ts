import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportsService } from '../../../../../services/reports.service';
import { Routing } from 'projects/security-company-dashboard/src/app/modules/core/routes/app-routes';
// @ts-ignore
import html2pdf from 'html2pdf.js';
@Component({
  selector: 'app-view-exclude-request',
  templateUrl: './view-exclude-request.component.html',
  styleUrls: ['./view-exclude-request.component.scss']
})
export class ViewExcludeRequestComponent implements OnInit {
  transferDetails!:any;
  constructor(private route: ActivatedRoute,private _reports:ReportsService , private _route:Router) {
    this.transferDetailsByID();
  }



  ngOnInit(): void {
  }

 transferDetailsByID(){
  this.route.params.subscribe((res) => {
    console.log(res);

    let id = res['id'];
  this._reports.getTransferDetailsByID(id).subscribe((res)=>{
    this.transferDetails=res
    console.log(res);

  })
  });
 }

 next(){
  this._route.navigate([`/${Routing.dashboard}/${Routing.reports.module}/${Routing.reports.children.formExclude}`])
 }

 generatePDF() {
  console.log("Hi");
  const pdfOptions = {
    margin: 10,
    filename: 'my-pdf-document.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: {
      unit: 'mm',
      format: 'a4', // You can specify the page size here (e.g., 'letter', 'a4', 'legal', etc.)
      orientation: 'portrait', // 'portrait' for a vertical page or 'landscape' for a horizontal page
    },
  };
  const element = document.getElementById('dynamic-model-content');
  html2pdf()
    .from(element)
    .save('dailyFacts-file.pdf');
}

}
