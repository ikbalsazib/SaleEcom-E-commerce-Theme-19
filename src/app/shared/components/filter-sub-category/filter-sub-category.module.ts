import { NgModule } from '@angular/core';
import { FilterSubCategoryComponent } from './filter-sub-category.component';
import {RouterLink} from "@angular/router";



@NgModule({
    declarations: [
        FilterSubCategoryComponent
    ],
    exports: [
        FilterSubCategoryComponent
    ],
  imports: [
    RouterLink
  ]
})
export class FilterSubCategoryModule { }
