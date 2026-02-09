import { Component } from '@angular/core';
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5geodata_worldLow from "@amcharts/amcharts5-geodata/worldLow";

@Component({
  selector: 'app-world-map-component-2',
  imports: [],
  templateUrl: './world-map-component-2.html',
  styleUrl: './world-map-component-2.scss',
})
export class WorldMapComponent2 {

  /*
  * amCharts root instance.
  * Acts as the main container and lifecycle manager for all chart elements.
  */
  private root!: am5.Root;

  ngAfterViewInit(): void {

    /*
    * Create the amCharts root bound to the chart container element
    */
    this.root = am5.Root.new("chartdiv");

    /*
    * Main map chart configuration.
    * Defines projection, zooming, panning, and animation behavior.
    */
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

    /*
    * Polygon series displaying world countries.
    * Uses low-resolution geo data and excludes Antarctica.
    */
    const polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(this.root, {
        geoJSON: am5geodata_worldLow,
        exclude: ["AQ"]
      })
    );

    /*
    * Default polygon appearance and interaction settings.
    * Applied to all country shapes unless overridden per feature.
    */
    polygonSeries.mapPolygons.template.setAll({
      tooltipText: "{name}",
      interactive: true,
      fill: am5.color(0xaaaaaa),
      templateField: "polygonSettings"
    });

    /*
    * Visual state applied when a country polygon is hovered.
    */
    polygonSeries.mapPolygons.template.states.create("hover", {
      fill: am5.color(0x6794dc)
    });

    /*
    * Resets the map to its initial position and zoom
    * once the geo data has been fully loaded and validated.
    */
    polygonSeries.events.on("datavalidated", () => {
      chart.goHome();
    });
  }

  ngOnDestroy(): void {
    this.root?.dispose();
  }
}