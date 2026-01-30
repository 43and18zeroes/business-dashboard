import { effect, inject, Injectable, signal } from '@angular/core';
import { StorageService } from './storage-service';

const DARKMODE_KEY = 'darkMode';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly storage = inject(StorageService);

  darkMode = signal(false);

  initTheme() {
    // Temporarily disable transitions to prevent a visual "flash" or 
    // color sliding effect when the app loads and applies the initial theme.
    document.documentElement.classList.add('no__transition');
    this.loadDarkModeFromStorageOrSystem();
    this.listenToSystemPreferenceChanges();
    // Re-enable transitions after the initial theme has been applied 
    // to allow smooth animations for future manual toggles.
    setTimeout(() => {
      document.documentElement.classList.remove('no__transition');
    }, 100);
  }

  private loadDarkModeFromStorageOrSystem(): void {
    const saved = this.storage.getString(DARKMODE_KEY);
    if (saved !== null) {
      this.darkMode.set(saved === 'true');
    } else {
      const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
      this.darkMode.set(prefersDark);
    }
  }

  private listenToSystemPreferenceChanges(): void {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      const saved = this.storage.getString(DARKMODE_KEY);
      if (saved === null) this.darkMode.set(e.matches);
    });
  }

  applyThemeEffect = effect(() => {
    const dark = this.darkMode();
    document.body.classList.toggle('darkMode', dark);
    document.body.classList.toggle('lightMode', !dark);
  });

  private saveUserPreference(): void {
    this.storage.setString(DARKMODE_KEY, this.darkMode().toString());
  }

  toggleTheme() {
    this.darkMode.update(v => !v);
    this.saveUserPreference();
  }
}