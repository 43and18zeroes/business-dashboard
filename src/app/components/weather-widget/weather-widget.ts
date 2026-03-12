import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { catchError, interval, of, Subscription } from 'rxjs';
import { DeviceService } from '../../services/device-service';

interface WeatherApiResponse {
  current?: {
    time: string;
    temperature_2m: number;
    weather_code: number;
  };
  timezone?: string;
}

interface WeatherState {
  locationLabel: string;
  temperature: number | null;
  weatherCode: number | null;
  weatherText: string;
  weatherIcon: string;
  time: Date;
  loading: boolean;
  error: string | null;
}

@Component({
  selector: 'app-weather-widget',
  imports: [DatePipe],
  templateUrl: './weather-widget.html',
  styleUrl: './weather-widget.scss',
})
export class WeatherWidget {
  private http = inject(HttpClient);
  private deviceService = inject(DeviceService);
  isMobile = this.deviceService.isMobile;

  private readonly defaultLocation = {
    name: 'Munich',
    latitude: 48.1374,
    longitude: 11.5755,
  };

  private clockSub?: Subscription;
  private weatherRefreshSub?: Subscription;

  state = signal<WeatherState>({
    locationLabel: this.defaultLocation.name,
    temperature: null,
    weatherCode: null,
    weatherText: 'Loading weather...',
    weatherIcon: '⏳',
    time: new Date(),
    loading: true,
    error: null,
  });

  formattedTemperature = computed(() => {
    const temp = this.state().temperature;
    return temp === null ? '--' : `${Math.round(temp)}°C`;
  });

  ngOnInit(): void {
    const ua = navigator.userAgent;
    this.startClock();
    this.loadWeather();
    this.weatherRefreshSub = interval(15 * 60 * 1000).subscribe(() => {
      this.loadWeather();
    });
  }

  ngOnDestroy(): void {
    this.clockSub?.unsubscribe();
    this.weatherRefreshSub?.unsubscribe();
  }

  private startClock(): void {
    this.clockSub = interval(1000).subscribe(() => {
      this.state.update((current) => ({
        ...current,
        time: new Date(),
      }));
    });
  }

  private loadWeather(): void {
    this.state.update((current) => ({
      ...current,
      loading: true,
      error: null,
    }));

    this.getCoordinates()
      .then(({ latitude, longitude, label }) => {
        this.fetchWeather(latitude, longitude, label);
      })
      .catch(() => {
        this.fetchWeather(
          this.defaultLocation.latitude,
          this.defaultLocation.longitude,
          this.defaultLocation.name
        );
      });
  }

  private getCoordinates(): Promise<{ latitude: number; longitude: number; label: string }> {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        reject(new Error('Geolocation is not supported.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`
            );
            const data = await res.json();
            const label =
              data.address?.city ||
              data.address?.town ||
              data.address?.village ||
              data.address?.county ||
              'Current location';

            resolve({ latitude, longitude, label });
          } catch {
            resolve({ latitude, longitude, label: 'Current location' });
          }
        },
        () => reject(new Error('Location access denied or unavailable.')),
        {
          enableHighAccuracy: false,
          timeout: 8000,
          maximumAge: 10 * 60 * 1000,
        }
      );
    });
  }

  private fetchWeather(latitude: number, longitude: number, label: string): void {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`;

    this.http
      .get<WeatherApiResponse>(url)
      .pipe(
        catchError((error) => {
          console.error('Weather API Error:', error);
          this.state.update(s => ({
            ...s,
            loading: false,
            error: 'Weather data could not be loaded.',
            weatherIcon: '⚠️'
          }));
          return of(null);
        })
      )
      .subscribe((response) => {
        if (!response?.current) return;

        const weatherInfo = this.mapWeatherCode(response.current.weather_code);

        this.state.update((current) => ({
          ...current,
          locationLabel: label,
          temperature: response.current!.temperature_2m,
          weatherCode: response.current!.weather_code,
          weatherText: weatherInfo.text,
          weatherIcon: weatherInfo.icon,
          loading: false,
          error: null,
        }));
      });
  }

  private mapWeatherCode(code: number): { text: string; icon: string } {
    if (code === 0) return { text: 'Sunny', icon: '☀️' };
    if ([1, 2, 3].includes(code)) return { text: 'Cloudy', icon: '⛅' };
    if ([45, 48].includes(code)) return { text: 'Foggy', icon: '🌫️' };
    if ([51, 53, 55, 56, 57].includes(code)) return { text: 'Drizzle', icon: '🌦️' };
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { text: 'Rain', icon: '🌧️' };
    if ([71, 73, 75, 77, 85, 86].includes(code)) return { text: 'Snow', icon: '❄️' };
    if ([95, 96, 99].includes(code)) return { text: 'Thunderstorm', icon: '⛈️' };

    return { text: 'Unknown', icon: '🌍' };
  }

  refresh(): void {
    this.loadWeather();
  }
}