import { Component} from '@angular/core';
import {  FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [MatFormFieldModule,MatInputModule, FormsModule, ReactiveFormsModule, MatButtonModule,MatIconModule],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss'
})
export class SignInComponent {
  
}
