import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Checkout1Component } from './checkout-1.component';

const routes: Routes = [
  {
    path: '',
    component: Checkout1Component
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CheckoutRoutingModule { }
