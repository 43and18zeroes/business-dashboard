import { CommonModule } from '@angular/common';
import { Component, computed, model, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';

export type MenuItem = {
  icon?: string; 
  image?: string;
  label: string;
  route: string;
};

@Component({
  selector: 'app-custom-sidenav-component',
  imports: [CommonModule, MatListModule, MatIconModule, RouterModule],
  templateUrl: './custom-sidenav-component.html',
  styleUrl: './custom-sidenav-component.scss',
})
export class CustomSidenavComponent {
  sideNavCollapsed = signal(false);

  collapsed = model.required<boolean>();

  iconMargin = computed(() => (this.collapsed() ? '12px' : '16px'));

menuItems = signal<MenuItem[]>([
  { image: 'img/logo/dashboard-logo-24.webp', label: 'Dashboard', route: '/' },
  { icon: 'insert_chart', label: 'Monthy Sales', route: '/monthly-sales' },
]);
}
