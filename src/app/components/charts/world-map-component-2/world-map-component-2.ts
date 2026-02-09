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

        // ✅ Google Maps Verhalten
        panX: "translateX",
        panY: "translateY",
        wheelY: "zoom",
        pinchZoom: true
      })
    );

    chart.series.push(
      am5map.MapPolygonSeries.new(this.root, {
        geoJSON: am5geodata_worldLow,
      })
    );
  }


  ngOnDestroy(): void {
    if (this.root) {
      this.root.dispose();
    }
  }
}