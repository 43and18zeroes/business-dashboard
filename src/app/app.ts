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
    CustomSidenavComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {

  readonly appColors = inject(ColorService).availableColors;

  themeService = inject(ThemeService);
  collapsed = signal(true);
  viewportWidth = signal(window.innerWidth);

  constructor(private readonly color: ColorService) {
    this.color.initColor();
  }

  setColor(color: AppColor) {
    this.color.setColor(color);
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
