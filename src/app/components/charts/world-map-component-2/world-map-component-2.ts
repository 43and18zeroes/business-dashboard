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

  private root!: am5.Root;

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

    const polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(this.root, {
        geoJSON: am5geodata_worldLow,
        exclude: ["AQ"]
      })
    );

    polygonSeries.mapPolygons.template.setAll({
      tooltipText: "{name}",
      interactive: true,
      fill: am5.color(0xaaaaaa),
      templateField: "polygonSettings"
    });

    polygonSeries.mapPolygons.template.states.create("hover", {
      fill: am5.color(0x6794dc)
    });

    polygonSeries.events.on("datavalidated", () => {
      chart.goHome();
    });
  }

  ngOnDestroy(): void {
    this.root?.dispose();
  }
}