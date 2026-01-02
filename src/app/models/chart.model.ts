// src/app/models/chart.model.ts

export interface ChartData {
  label: string;
  value: number;
  color?: string;
}

export class ChartConfiguration {
  title: string;
  type: 'bar' | 'line' | 'pie';
  showLegend: boolean;

  constructor(options: Partial<ChartConfiguration> = {}) {
    this.title = options.title || 'Unnamed Diagramm';
    this.type = options.type || 'bar';
    this.showLegend = options.showLegend ?? true;
  }
}