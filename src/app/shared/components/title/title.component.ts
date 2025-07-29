import {Component, Input} from '@angular/core';
import {RouterLink} from '@angular/router';
import {DeliveryCharge} from "../../../interfaces/common/setting.interface";
import {JsonPipe} from "@angular/common";

@Component({
  selector: 'app-title',
  templateUrl: './title.component.html',
  styleUrl: './title.component.scss',
  imports: [
    RouterLink,
    JsonPipe
  ],
  standalone: true
})
export class TitleComponent {
  @Input() title: string;
  @Input() urlTitle: string;
  @Input() url: string;
  @Input() selectedNote: string;

}
