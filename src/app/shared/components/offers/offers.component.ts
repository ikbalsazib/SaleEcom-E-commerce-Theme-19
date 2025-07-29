import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-offers',
  standalone: true,
  imports: [],
  templateUrl: './offers.component.html',
  styleUrl: './offers.component.scss'
})
export class OffersComponent {
  @Input() inputData! : any;

  ngOnInit(){
  }

}
