import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountSidebarComponent } from './account-sidebar.component';

const routes: Routes = [
  {
    path: '',
    component: AccountSidebarComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountSidebarRoutingModule { }
