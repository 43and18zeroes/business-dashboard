import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CustomSidenavComponent } from './components/custom-sidenav-component/custom-sidenav-component';
import { ThemeService } from './services/theme-service';
import { RouterOutlet } from '@angular/router';
import { ColorService } from './services/color-service';
import { AppColor } from './services/color.tokens';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    MatToolbarModule,
    MatIconModule,
    MatSidenavModule,
    MatButtonModule,
    MatSlideToggleModule,
    CustomSidenavComponent,
    CommonModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {

  appColors: AppColor[] = [
    'Cobalt Core',
    'Emerald Edge',
    'Infra Red',
    'Sunset Grid',
    'Neon Orchid',
  ];

  currentTheme = computed(() => this.color.theme());

  themeService = inject(ThemeService);
  collapsed = signal(true);
  viewportWidth = signal(window.innerWidth);

  constructor(private readonly color: ColorService) {
    this.color.init();
  }

  setColor(color: AppColor) {
    this.color.setTheme(color);
  }

  ngOnInit() {
    this.themeService.initTheme();
  }

  @HostListener('window:resize')
  onResize() {
    this.viewportWidth.set(window.innerWidth);
    this.collapsed.set(true);
  }

  sidenavWidth = computed(() => (this.collapsed() ? '81px' : '250px'));
  contentMarginLeft = computed(() => {
    const width = this.viewportWidth();
    if (width < 600) {
      return '81px';
    }
    return this.collapsed() ? '81px' : '250px';
  });

  collapseSidenav() {
    this.collapsed.set(true);
  }
}
