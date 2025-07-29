import {Component, HostListener, Input, SimpleChanges} from '@angular/core';
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-social-chat',
  templateUrl: './social-chat.component.html',
  styleUrl: './social-chat.component.scss',
  standalone: true,
  imports: [
    NgClass
  ]
})
export class SocialChatComponent {
  @Input() shopInfo:any;
  @Input() chatLink:any;

  // Store Data
  toggleStyle: boolean = false;


  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    // Check if the clicked target is not part of the header
    if (!(event.target as HTMLElement).closest('.icon-bar')) {
      this.toggleStyle = false;
    }
  }

  toggle() {
    this.toggleStyle = !this.toggleStyle;
  }
}
