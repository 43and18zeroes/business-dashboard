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

interface Coordinates {
  latitude: number;
  longitude: number;
  label: string;
}

interface LocationDefinition {
  name: string;
  latitude: number;
  longitude: number;
}

interface WeatherPresentation {
  text: string;
  icon: string;
}

interface WeatherCodeGroup {
  codes: number[];
  presentation: WeatherPresentation;
}

@Component({
  selector: 'app-weather-widget',
  imports: [DatePipe],
  templateUrl: './weather-widget.html',
  styleUrl: './weather-widget.scss',
})
export class WeatherWidget {
  private readonly httpClient = inject(HttpClient);
  private readonly deviceService = inject(DeviceService);

  readonly isMobile = this.deviceService.isMobile;

  private readonly refreshIntervalInMilliseconds = 15 * 60 * 1000;
  private readonly clockIntervalInMilliseconds = 1000;
  private readonly geolocationTimeoutInMilliseconds = 8000;
  private readonly geolocationHardTimeoutInMilliseconds = 9000;
  private readonly geolocationMaximumAgeInMilliseconds = 10 * 60 * 1000;

  private readonly defaultLocation: LocationDefinition = {
    name: 'Munich',
    latitude: 48.1374,
    longitude: 11.5755,
  };

  private readonly defaultWeatherPresentation: WeatherPresentation = {
    text: 'Loading weather...',
    icon: '⏳',
  };

  private readonly fallbackWeatherPresentation: WeatherPresentation = {
    text: 'Unknown',
    icon: '🌍',
  };

  private readonly weatherCodeGroups: WeatherCodeGroup[] = [
    { codes: [0], presentation: { text: 'Sunny', icon: '☀️' } },
    { codes: [1, 2, 3], presentation: { text: 'Cloudy', icon: '⛅' } },
    { codes: [45, 48], presentation: { text: 'Foggy', icon: '🌫️' } },
    { codes: [51, 53, 55, 56, 57], presentation: { text: 'Drizzle', icon: '🌦️' } },
    { codes: [61, 63, 65, 66, 67, 80, 81, 82], presentation: { text: 'Rain', icon: '🌧️' } },
    { codes: [71, 73, 75, 77, 85, 86], presentation: { text: 'Snow', icon: '❄️' } },
    { codes: [95, 96, 99], presentation: { text: 'Thunderstorm', icon: '⛈️' } },
  ];

  private clockSubscription?: Subscription;
  private weatherRefreshSubscription?: Subscription;
  private permissionStatus?: PermissionStatus;

  readonly state = signal<WeatherState>({
    locationLabel: this.defaultLocation.name,
    temperature: null,
    weatherCode: null,
    weatherText: this.defaultWeatherPresentation.text,
    weatherIcon: this.defaultWeatherPresentation.icon,
    time: new Date(),
    loading: true,
    error: null,
  });

  readonly formattedTemperature = computed(() => {
    const currentTemperature = this.state().temperature;
    return currentTemperature === null ? '--' : `${Math.round(currentTemperature)}°C`;
  });

  ngOnInit(): void {
    this.startClock();
    this.loadWeather();
    this.startWeatherRefresh();
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    this.watchLocationPermission();
  }

  ngOnDestroy(): void {
    this.clockSubscription?.unsubscribe();
    this.weatherRefreshSubscription?.unsubscribe();
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    this.permissionStatus?.removeEventListener('change', this.handlePermissionChange);
  }

  refresh(): void {
    this.loadWeather();
  }

  private startClock(): void {
    this.clockSubscription = interval(this.clockIntervalInMilliseconds).subscribe(() => {
      this.updateState({ time: new Date() });
    });
  }

  private startWeatherRefresh(): void {
    this.weatherRefreshSubscription = interval(this.refreshIntervalInMilliseconds).subscribe(() => {
      this.loadWeather();
    });
  }

  private watchLocationPermission(): void {
    if (!navigator.permissions) {
      return;
    }

    navigator.permissions.query({ name: 'geolocation' }).then((permissionStatus) => {
      this.permissionStatus = permissionStatus;
      permissionStatus.addEventListener('change', this.handlePermissionChange);
    });
  }

  private readonly handlePermissionChange = (): void => {
    if (this.permissionStatus?.state !== 'granted') {
      return;
    }

    this.loadWeather();
  };

  private readonly handleVisibilityChange = (): void => {
    if (document.visibilityState !== 'visible') {
      return;
    }

    this.loadWeather();
  };

  private loadWeather(): void {
    this.setLoadingState();

    this.resolveCoordinates()
      .then((coordinates) => this.fetchWeather(coordinates))
      .catch(() => this.fetchWeather(this.createDefaultCoordinates()));
  }

  private setLoadingState(): void {
    this.updateState({
      loading: true,
      error: null,
    });
  }

  private createDefaultCoordinates(): Coordinates {
    return {
      latitude: this.defaultLocation.latitude,
      longitude: this.defaultLocation.longitude,
      label: `${this.defaultLocation.name} · default location`,
    };
  }

  private resolveCoordinates(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        reject(new Error('Geolocation is not supported.'));
        return;
      }

      const timeoutId = setTimeout(() => {
        reject(new Error('Geolocation timed out.'));
      }, this.geolocationHardTimeoutInMilliseconds);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          clearTimeout(timeoutId);

          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          const locationLabel = await this.resolveLocationLabel(latitude, longitude);

          resolve({
            latitude,
            longitude,
            label: locationLabel,
          });
        },
        (error) => {
          clearTimeout(timeoutId);
          reject(error);
        },
        {
          enableHighAccuracy: false,
          timeout: this.geolocationTimeoutInMilliseconds,
          maximumAge: this.geolocationMaximumAgeInMilliseconds,
        }
      );
    });
  }

  private async resolveLocationLabel(latitude: number, longitude: number): Promise<string> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`
      );
      const data = await response.json();

      return (
        data.address?.city ??
        data.address?.town ??
        data.address?.village ??
        data.address?.county ??
        'Current location'
      );
    } catch {
      return 'Current location';
    }
  }

  private fetchWeather(coordinates: Coordinates): void {
    const url = this.buildWeatherUrl(coordinates.latitude, coordinates.longitude);

    this.httpClient
      .get<WeatherApiResponse>(url)
      .pipe(
        catchError(() => {
          this.setWeatherErrorState();
          return of(null);
        })
      )
      .subscribe((response) => {
        if (!response?.current) {
          this.updateState({ loading: false });
          return;
        }

        this.applyWeatherData(response.current.temperature_2m, response.current.weather_code, coordinates.label);
      });
  }

  private buildWeatherUrl(latitude: number, longitude: number): string {
    return `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`;
  }

  private setWeatherErrorState(): void {
    this.updateState({
      loading: false,
      error: 'Weather data could not be loaded.',
      weatherIcon: '⚠️',
    });
  }

  private applyWeatherData(temperature: number, weatherCode: number, locationLabel: string): void {
    const weatherPresentation = this.mapWeatherCode(weatherCode);

    this.updateState({
      locationLabel,
      temperature,
      weatherCode,
      weatherText: weatherPresentation.text,
      weatherIcon: weatherPresentation.icon,
      loading: false,
      error: null,
    });
  }

  private mapWeatherCode(weatherCode: number): WeatherPresentation {
    const matchingGroup = this.weatherCodeGroups.find((group) => group.codes.includes(weatherCode));
    return matchingGroup?.presentation ?? this.fallbackWeatherPresentation;
  }

  private updateState(patch: Partial<WeatherState>): void {
    this.state.update((currentState) => ({
      ...currentState,
      ...patch,
    }));
  }
}