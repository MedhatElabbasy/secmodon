import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PackagesService } from '../services/packages.service';
import { Routing } from '../../core/routes/app-routes';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
})
export class PaymentComponent implements OnInit {
  successfully!: boolean;
  constructor(private route: ActivatedRoute,
    private PackagesService: PackagesService,
    private router: Router
  ) { }

  ngOnInit(): void {

    this.route.queryParams.subscribe((res: any) => {
      console.log(res?.TrackId);

      if (res?.Result == 'Successful') {
        this.successfully = true;

        let model = {
          responseUrl: window.location.href,
          isSuccess: true,
          trackId: res?.TrackId
        }
        console.log(model);

        this.PackagesService.updatePayment(model).subscribe((res2) => {
          console.log(res2);
        })
      } else {
        this.successfully = false;
      }
    });
  }
  back() {
    this.router.navigate([`/${Routing.dashboard}`]);
  }
}
