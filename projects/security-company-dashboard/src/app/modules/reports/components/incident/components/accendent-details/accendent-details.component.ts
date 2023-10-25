import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ReportsService } from '../../../../services/reports.service';

@Component({
  selector: 'app-accendent-details',
  templateUrl: './accendent-details.component.html',
  styleUrls: ['./accendent-details.component.scss']
})
export class AccendentDetailsComponent implements OnInit, AfterViewInit {

  constructor(private _ReportsService: ReportsService) { }
  incidentDetails: any;
  ngOnInit(): void {
    this._ReportsService.incidentDetails.subscribe((res) => {
      this.incidentDetails = res
      console.log(this.incidentDetails);
    })


  }

  ngAfterViewInit(): void {
    // Get the modal
    const modal = document.getElementById("myModal") as HTMLDivElement | null;

    // Get the image and insert it inside the modal - use its "alt" text as a caption
    const img1: any = document.getElementById("myImg1") as HTMLImageElement | null;
    const img2: any = document.getElementById("myImg2") as HTMLImageElement | null;
    const modalImg = document.getElementById("img01") as HTMLImageElement | null;
    const captionText = document.getElementById("caption") as HTMLDivElement | null;

    if ((img1 || img2) && modal && modalImg && captionText) {
      img1.onclick = () => {
        modal.style.display = "block";
        if (modalImg && img1.src) {
          modalImg.src = img1.src;
          if (img1.alt) {
            captionText.innerHTML = img1.alt;
          }
        }
      };
      img2.onclick = () => {
        modal.style.display = "block";
        if (modalImg && img2.src) {
          modalImg.src = img2.src;
          if (img2.alt) {
            captionText.innerHTML = img2.alt;
          }
        }
      };

      // Get the <span> element that closes the modal
      const span = document.getElementsByClassName("close")[0] as HTMLSpanElement | undefined;

      if (span) {
        // When the user clicks on <span> (x), close the modal
        span.onclick = () => {
          if (modal) {
            modal.style.display = "none";
          }
        };
      }
    }
  }



}
