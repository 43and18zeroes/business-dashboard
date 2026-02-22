import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { Chart, registerables } from 'chart.js';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';

registerLocaleData(localeDe);

Chart.register(...registerables);

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
