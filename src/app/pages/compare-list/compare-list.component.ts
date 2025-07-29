import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ReloadService } from '../../services/core/reload.service';
import { ProductService } from '../../services/common/product.service';
import {OrderLoaderComponent} from "../../shared/loader/order-loader/order-loader.component";
import {CompareLoaderComponent} from "../../shared/loader/compare-loader/compare-loader.component";
import {NgStyle} from "@angular/common";
import {RouterLink} from "@angular/router";
import {CurrencyCtrPipe} from '../../shared/pipes/currency.pipe';

@Component({
  selector: 'app-compare-list',
  templateUrl: './compare-list.component.html',
  styleUrl: './compare-list.component.scss',
  standalone: true,
  imports: [
    OrderLoaderComponent,
    CompareLoaderComponent,
    NgStyle,
    RouterLink,
    CurrencyCtrPipe
  ]
})
export class CompareListComponent implements OnInit, OnDestroy {

  // Store Data
  compareListV2: string[] | any[] = [];
  compareListFromDB: any;
  isLoading = true;
  isEmpty = true;

  // Inject
  private readonly productService = inject(ProductService);
  private readonly reloadService = inject(ReloadService);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.handleCompareListRefresh();
    // Base Data
    this.getCompareList();
  }

  /**
   * Handle Compare List Refresh
   */
  private handleCompareListRefresh(): void {
    const sub = this.reloadService.refreshCompareList$.subscribe(() => {
      this.getCompareList();
    });
    this.subscriptions?.push(sub);
  }

  /**
   * Fetch Compare List from DB
   */
  private getCompareListFromDB(): void {
    const mCompareList = this.compareListV2.map(m => m._id);
    const sub = this.productService.getProductByIds(mCompareList).subscribe({
      next: res => {
        this.compareListFromDB = res.data;
        this.isEmpty = false;
        this.isLoading = false;
      },
      error: () => {
        this.isEmpty = true;
        this.isLoading = false;
      }
    });
    this.subscriptions?.push(sub);
  }

  /**
   * Handle Local Storage Data
   */
  private getCompareList(): void {
    this.compareListV2 = this.productService.getCompareList();
    if (this.compareListV2 && this.compareListV2.length > 0) {
      this.getCompareListFromDB();
    } else {
      this.isEmpty = true;
    }
  }

  removeItem(id: string): void {
    this.productService.deleteCompareItem(id);
    this.reloadService.needRefreshCompareList$();
    this.getCompareListFromDB();
  }

  /**
   * On Destroy
   */
  ngOnDestroy(): void {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }

}
