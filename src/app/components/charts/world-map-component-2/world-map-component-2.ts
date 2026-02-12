import { Component, effect, inject } from '@angular/core';
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5geodata_worldLow from "@amcharts/amcharts5-geodata/worldLow";
import { ColorService } from '../../../services/color-service';

@Component({
  selector: 'app-world-map-component-2',
  imports: [],
  templateUrl: './world-map-component-2.html',
  styleUrl: './world-map-component-2.scss',
})
export class WorldMapComponent2 {
  private readonly colorService = inject(ColorService);
  private root!: am5.Root;
  private polygonSeries!: am5map.MapPolygonSeries;

  constructor() {
    effect(() => {
      const tokens = this.colorService.tokens();
      this.updateMapColors(tokens.primary, tokens.secondary);
    });
  }

  ngAfterViewInit(): void {
    this.root = am5.Root.new("chartdiv");

    const chart = this.root.container.children.push(
      am5map.MapChart.new(this.root, {
        projection: am5map.geoMercator(),
        panX: "rotateX",
        panY: "translateY",
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

    const tooltip = am5.Tooltip.new(this.root, {
      labelText: "{name}",
      pointerOrientation: "horizontal",
      animationDuration: 160,
      animationEasing: am5.ease.out(am5.ease.cubic),
    });

    tooltip.set("background", am5.RoundedRectangle.new(this.root, {
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

    tooltip.states.create("hidden", { opacity: 0, scale: 0.92 });
    tooltip.states.create("default", { opacity: 1, scale: 1 });

    this.polygonSeries.mapPolygons.template.setAll({
      tooltip,
      tooltipText: "{name}",
      interactive: true,
      templateField: "polygonSettings",
      stateAnimationDuration: 200,
      stateAnimationEasing: am5.ease.out(am5.ease.cubic),
    });

    this.polygonSeries.mapPolygons.template.states.create("hover", {});
    const initialTokens = this.colorService.tokens();
    this.updateMapColors(initialTokens.primary, initialTokens.secondary);
    this.polygonSeries.events.on("datavalidated", () => chart.goHome());
  }


  private updateMapColors(primary: string, secondary: string) {
    if (!this.polygonSeries) return;

    const primaryColor = am5.color(primary);
    const secondaryColor = am5.color(secondary);
    this.polygonSeries.mapPolygons.template.set("fill", primaryColor);
    const hoverTemplate = this.polygonSeries.mapPolygons.template.states.lookup("hover");

    if (hoverTemplate) {
      hoverTemplate.set("fill", secondaryColor);
    }

    this.polygonSeries.mapPolygons.each((polygon) => {
      polygon.set("fill", primaryColor);
      const hoverState = polygon.states.lookup("hover");

      if (hoverState) {
        hoverState.set("fill", secondaryColor);
      }

      const defaultState = polygon.states.lookup("default");

      if (defaultState) {
        defaultState.set("fill", primaryColor);
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