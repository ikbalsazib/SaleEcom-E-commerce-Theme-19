import { NgModule } from '@angular/core';
import { FilterBrandComponent } from './filter-brand.component';
import {RouterLink} from "@angular/router";



@NgModule({
    declarations: [
        FilterBrandComponent
    ],
    exports: [
        FilterBrandComponent
    ],
    imports: [
        RouterLink
    ]
})
export class FilterBrandModule { }
