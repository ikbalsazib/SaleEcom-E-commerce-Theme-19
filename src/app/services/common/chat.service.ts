import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private chatVisibility = new BehaviorSubject<boolean>(false);
  chatVisibility$ = this.chatVisibility.asObservable();
}
