import {Component, HostListener, Input} from '@angular/core';
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

  @Input() chatLink:any;

  // Store Data
  toggleStyle: boolean = false;

  getSocialLink(type: string): any {
    switch (type) {
      case 'messenger':
        return this.chatLink?.find(f => f.chatType === 'messenger') ?? null;
      case 'whatsapp':
        return this.chatLink?.find(f => f.chatType === 'whatsapp') ?? null;
      case 'phone':
        return this.chatLink?.find(f => f.chatType === 'phone') ?? null;
      default:
        return null;
    }
  }

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
