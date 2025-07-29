import {Component, inject, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {Subscription} from 'rxjs';
import {Title} from '@angular/platform-browser';
import {OrderService} from '../../../services/common/order.service';
import {isPlatformBrowser} from "@angular/common";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {Invoice} from "../../../interfaces/common/invoice.interface";
import {CurrencyCtrPipe} from '../../../shared/pipes/currency.pipe';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrl: './invoice.component.scss',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    RouterLink,
    CurrencyCtrPipe,
  ]
})
export class InvoiceComponent implements OnInit, OnDestroy {

  // Store Data
  id: string;
  invoice: Invoice;
  private intervalId: any;

  // Loading
  isLoading: boolean = true;

  // Inject
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly orderService = inject(OrderService);
  private readonly title = inject(Title);
  private readonly platformId = inject(PLATFORM_ID);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const subscription = this.activatedRoute.paramMap.subscribe((param) => {
        this.id = param.get('id');
        if (this.id) {
          this.generateInvoiceById();
        }
      });
      this.subscriptions?.push(subscription);

      // Base Data
      this.setPageData();
    }

  }

  /**
   * Page Data
   * setPageData()
   */
  private setPageData(): void {
    this.title.setTitle('Invoice');
  }

  /**
   * HTTP Req Handle
   * generateInvoiceById()
   * getTotaQuantity()
   */

  generateInvoiceById() {
    const subscription = this.orderService.generateInvoiceById(this.id)
      .subscribe({
        next: (res) => {
          this.invoice = res.data;
          this.isLoading = false;
          if (this.invoice) {
            this.title.setTitle(`Invoice #${this.invoice.orderId}`);
            // Automatically trigger the print dialog
            setTimeout(() => {
              this.printInvoice();
            }, 0)
          }
        },
        error: (err) => {
          console.log(err)
        }
      });
    this.subscriptions?.push(subscription);
  }

  getTotaQuantity(data:any){
    let qty = 0
    data.forEach(mm=> {
      qty +=   mm.quantity
    })
    return qty
  }

  /**
   * Print Method
   * printInvoice()
   */

  protected printInvoice(): void {
    window.print();
  }


  /**
   * ON Destroy
   */
  ngOnDestroy() {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }

}
