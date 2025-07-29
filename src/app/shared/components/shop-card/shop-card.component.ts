import { Component } from '@angular/core';

@Component({
  selector: 'app-shop-card',
  standalone: true,
  imports: [],
  templateUrl: './shop-card.component.html',
  styleUrl: './shop-card.component.scss'
})
export class ShopCardComponent {
  buttonText: string = 'Click to Select';
  cardColor: string = 'white';

  toggleState() {
    if (this.buttonText === 'Click to Select') {
      this.buttonText = 'Submitted';
      this.cardColor = 'lightblue'; 
    } else {
      this.buttonText = 'Click to Select';
      this.cardColor = 'white'; 
    }
  }
}


