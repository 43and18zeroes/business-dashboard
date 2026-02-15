import { Component, effect, inject } from '@angular/core';
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5geodata_worldLow from "@amcharts/amcharts5-geodata/worldLow";
import { ColorService } from '../../../services/color-service';
import { ThemeService } from '../../../services/theme-service';

@Component({
  selector: 'app-world-map-component',
  imports: [],
  templateUrl: './world-map-component.html',
  styleUrl: './world-map-component.scss',
})
export class WorldMapComponent {
  private readonly colorService = inject(ColorService);
  private readonly themeService = inject(ThemeService);
  private root!: am5.Root;
  private polygonSeries!: am5map.MapPolygonSeries;
  private tooltip!: am5.Tooltip;

  private getCSSVariable(name: string): string {
    const dummy = document.createElement('div');
    dummy.style.color = `var(${name})`;
    dummy.style.display = 'none';
    document.body.appendChild(dummy);

    const computedColor = getComputedStyle(dummy).color;

    document.body.removeChild(dummy);
    return computedColor;
  }

  constructor() {
    effect(() => {
      const tokens = this.colorService.tokens();
      this.themeService.darkMode();
      const strokeColor = this.getCSSVariable('--bg-color');
      this.updateMapColors(tokens.primary, tokens.secondary, strokeColor);
    });
  }

  ngAfterViewInit(): void {
    this.root = am5.Root.new("chartdiv");

    const chart = this.root.container.children.push(
      am5map.MapChart.new(this.root, {
        projection: am5map.geoMercator(),
        panX: "translateX",
        panY: "translateY",
        maxPanOut: 0.25,
        wheelY: "zoom",
        pinchZoom: true,
        homeZoomLevel: 2,
        minZoomLevel: 2,
        maxZoomLevel: 32,
        zoomStep: 2,
        animationDuration: 600,
        animationEasing: am5.ease.out(am5.ease.cubic),
        centerMapOnZoomOut: true
      })
    );

    this.polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(this.root, {
        geoJSON: am5geodata_worldLow,
        exclude: ["AQ"]
      })
    );

    this.tooltip = am5.Tooltip.new(this.root, {
      getFillFromSprite: false, // Wichtig, damit manuelles 'fill' Priorität hat
      labelText: "{name}",
      pointerOrientation: "horizontal",
      animationDuration: 160,
      animationEasing: am5.ease.out(am5.ease.cubic),
    });

    chart.events.on("pointerdown", () => {
      this.tooltip.hide();
      this.tooltip.set("forceHidden", true);
    });

    this.root.container.events.on("globalpointerup", () => {
      this.tooltip.set("forceHidden", false);
    });

    chart.events.on("wheel", () => {
      this.tooltip.hide();
    });

    this.tooltip.set("background", am5.RoundedRectangle.new(this.root, {
      cornerRadiusTL: 8,
      fillOpacity: 0.95,
      stroke: am5.color("#B0B0B0"),
      strokeWidth: 1,
      strokeOpacity: 0.9,
      shadowColor: am5.color(0x000000),
      shadowBlur: 8,
      shadowOffsetX: 0,
      shadowOffsetY: 2,
    }));

    this.tooltip.states.create("hidden", { opacity: 0, scale: 0.92 });
    this.tooltip.states.create("default", { opacity: 1, scale: 1 });

    this.polygonSeries.mapPolygons.template.setAll({
      tooltip: this.tooltip,
      tooltipText: "{name}",
      interactive: true,
      templateField: "polygonSettings",
      stateAnimationDuration: 200,
      stateAnimationEasing: am5.ease.out(am5.ease.cubic),
    });

    this.polygonSeries.mapPolygons.template.states.create("hover", {});
    const initialTokens = this.colorService.tokens();
    const strokeColor = this.getCSSVariable('--bg-color');
    this.updateMapColors(initialTokens.primary, initialTokens.secondary, strokeColor);
    this.polygonSeries.events.on("datavalidated", () => chart.goHome());
  }

  private updateMapColors(primary: string, secondary: string, strokeColor: string) {
    if (!this.polygonSeries || !this.tooltip) return;

    const primaryColor = am5.color(primary);
    const secondaryColor = am5.color(secondary);
    const am5Stroke = am5.color(strokeColor);
    this.polygonSeries.mapPolygons.template.set("fill", primaryColor);
    this.polygonSeries.mapPolygons.template.set("stroke", am5Stroke);
    const hoverTemplate = this.polygonSeries.mapPolygons.template.states.lookup("hover");

    this.tooltip.get("background")?.set("fill", primaryColor);

    if (hoverTemplate) {
      hoverTemplate.set("fill", secondaryColor);
    }

    this.polygonSeries.mapPolygons.each((polygon) => {
      polygon.set("fill", primaryColor);
      polygon.set("stroke", am5Stroke);
      const hoverState = polygon.states.lookup("hover");

      if (hoverState) {
        hoverState.set("fill", secondaryColor);
      }

      const defaultState = polygon.states.lookup("default");

      if (defaultState) {
        defaultState.set("fill", primaryColor);
        polygon.set("stroke", am5Stroke);
      } else {
        polygon.states.create("default", {
          fill: primaryColor
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.root?.dispose();
  }
}