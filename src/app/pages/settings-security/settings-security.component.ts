import { Component } from '@angular/core';

@Component({
  selector: 'app-settings-security',
  templateUrl: './settings-security.component.html',
  styleUrl: './settings-security.component.scss',
  standalone: true,
  imports: []
})
export class SettingsSecurityComponent {

  // Store Data
  tabs: string[] = ['Team', 'Security', 'Referrals', 'Feature Preview'];
  selectedTab: number = 0;

  // Select Tab
  selectTab(index: number): void {
    this.selectedTab = index;
  }
}
