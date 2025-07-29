import {Component, inject, Input, OnDestroy, OnInit} from '@angular/core';
import {MatRipple} from '@angular/material/core';
import {RouterLink} from '@angular/router';
import {BreakpointObserver} from '@angular/cdk/layout';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-mobile-header',
  standalone: true,
  imports: [
    MatRipple,
    RouterLink
  ],
  templateUrl: './mobile-header.component.html',
  styleUrl: './mobile-header.component.scss'
})
export class MobileHeaderComponent implements  OnInit, OnDestroy{

  @Input() navigateBackUrl: string = '/';
  @Input() title: string = 'Back';

  // Store Data
  isMobile: boolean = true;

  // Inject
  private readonly breakpointObserver = inject(BreakpointObserver);

  // Subscriptions
  private subscriptions: Subscription[];


  ngOnInit() {
    // Base
    this.initBreakpointSubscription();
  }

  private initBreakpointSubscription() {
    const subscription = this.breakpointObserver
      .observe(['(min-width: 600px)'])
      .subscribe(result => {
        this.isMobile = !result.matches;
      });
    this.subscriptions?.push(subscription);
  }

  /**
   * On Destroy
   */
  ngOnDestroy(): void {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }

}
