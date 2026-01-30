import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  getString(key: string): string | null {
    try { return localStorage.getItem(key); } catch { return null; }
  }

  setString(key: string, value: string): void {
    try { localStorage.setItem(key, value); } catch { }
  }

  remove(key: string): void {
    try { localStorage.removeItem(key); } catch { }
  }
}
