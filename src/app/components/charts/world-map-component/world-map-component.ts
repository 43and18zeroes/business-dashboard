import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  ViewChild,
} from "@angular/core";

import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

import am5geodata_worldLow from "@amcharts/amcharts5-geodata/worldLow";
import am5geodata_data_countries2 from "@amcharts/amcharts5-geodata/data/countries2";

type Countries2Entry = {
  continent_code: "AF" | "AN" | "AS" | "EU" | "NA" | "OC" | "SA";
  maps: string[];
};

@Component({
  selector: "app-amcharts-drilldown-map",
  standalone: true,
  templateUrl: './world-map-component.html',
  styles: [
    `
      :host {
        display: block;
      }
      .chart {
        width: 100%;
        height: 500px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AmchartsDrilldownMapComponent implements AfterViewInit, OnDestroy {
  @ViewChild("chartdiv", { static: true }) private chartDiv!: ElementRef<HTMLDivElement>;

  @Input() height: string = "500px";
  @Input() projection: "mercator" | "naturalEarth1" = "mercator";

  private root?: am5.Root;

  constructor(private zone: NgZone) { }

  ngAfterViewInit(): void {
    this.chartDiv.nativeElement.style.height = this.height;

    this.zone.runOutsideAngular(() => {
      this.root = this.createChart(this.chartDiv.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.zone.runOutsideAngular(() => {
      this.root?.dispose();
      this.root = undefined;
    });
  }

  private createChart(container: HTMLDivElement): am5.Root {
    const continents: Record<string, number> = {
      AF: 0,
      AN: 1,
      AS: 2,
      EU: 3,
      NA: 4,
      OC: 5,
      SA: 6,
    };

    const root = am5.Root.new(container);

    const colors = am5.ColorSet.new(root, {});
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: "rotateX",
        projection:
          this.projection === "naturalEarth1"
            ? am5map.geoNaturalEarth1()
            : am5map.geoMercator(),
      })
    );

    const worldSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_worldLow as any,
        exclude: ["AQ"],
      })
    );

    worldSeries.mapPolygons.template.setAll({
      tooltipText: "{name}",
      interactive: true,
      fill: am5.color(0xaaaaaa),
      templateField: "polygonSettings",
    });

    worldSeries.mapPolygons.template.states.create("hover", {
      fill: colors.getIndex(9),
    });

    const countrySeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        visible: false,
      })
    );

    countrySeries.mapPolygons.template.setAll({
      tooltipText: "{name}",
      interactive: true,
      fill: am5.color(0xaaaaaa),
    });

    countrySeries.mapPolygons.template.states.create("hover", {
      fill: colors.getIndex(9),
    });

    const data: Array<{
      id: string;
      map: string;
      polygonSettings: { fill: am5.Color };
    }> = [];

    const countries2 = am5geodata_data_countries2 as unknown as Record<string, Countries2Entry>;

    for (const id in countries2) {
      if (!Object.prototype.hasOwnProperty.call(countries2, id)) continue;

      const country = countries2[id];
      if (!country?.maps?.length) continue;

      data.push({
        id,
        map: country.maps[0],
        polygonSettings: {
          fill: colors.getIndex(continents[country.continent_code]),
        },
      });
    }

    worldSeries.data.setAll(data);

    const backContainer = chart.children.push(
      am5.Container.new(root, {
        x: am5.p100,
        centerX: am5.p100,
        dx: -10,
        paddingTop: 5,
        paddingRight: 10,
        paddingBottom: 5,
        y: 30,
        interactiveChildren: false,
        layout: root.horizontalLayout,
        cursorOverStyle: "pointer",
        background: am5.RoundedRectangle.new(root, {
          fill: am5.color(0xffffff),
          fillOpacity: 0.2,
        }),
        visible: false,
      })
    );

    backContainer.children.push(
      am5.Label.new(root, {
        text: "Back to world map",
        centerY: am5.p50,
      })
    );

    backContainer.children.push(
      am5.Graphics.new(root, {
        width: 32,
        height: 32,
        centerY: am5.p50,
        fill: am5.color(0x555555),
        svgPath:
          "M10 4 L6 8 L10 12 M6 8 L18 8",
      })
    );

    let currentDataItem: am5.DataItem<am5map.IMapPolygonSeriesDataItem> | undefined;

    worldSeries.mapPolygons.template.events.on("click", (ev) => {
      const dataItem = ev.target.dataItem;
      if (!dataItem) return;

      const ctx = dataItem.dataContext as any;
      if (!ctx?.map) return;

      currentDataItem = dataItem as unknown as am5.DataItem<am5map.IMapPolygonSeriesDataItem>;

      const zoomAnimation = worldSeries.zoomToDataItem(
        dataItem as unknown as am5.DataItem<am5map.IMapPolygonSeriesDataItem>
      );

      Promise.all([
        zoomAnimation?.waitForStop() ?? Promise.resolve(),
        am5.net.load(`https://cdn.amcharts.com/lib/5/geodata/json/${ctx.map}.json`, chart),
      ]).then((results) => {
        const geodata = am5.JSONParser.parse((results[1] as any).response);

        countrySeries.setAll({
          geoJSON: geodata,
          fill: ctx.polygonSettings?.fill,
        });

        countrySeries.show();
        worldSeries.hide(100);
        backContainer.show();

        chart.set("minZoomLevel", chart.get("zoomLevel"));
      });
    });


    backContainer.events.on("click", () => {
      chart.set("minZoomLevel", 1);
      chart.goHome();
      worldSeries.show();
      countrySeries.hide();
      backContainer.hide();
      currentDataItem = undefined;
    });

    const zoomControl = chart.set("zoomControl", am5map.ZoomControl.new(root, {}));

    const homeButton = zoomControl.children.moveValue(
      am5.Button.new(root, {
        paddingTop: 10,
        paddingBottom: 10,
        icon: am5.Graphics.new(root, {
          svgPath:
            "M16,8 L14,8 L14,16 L10,16 L10,10 L6,10 L6,16 L2,16 L2,8 L0,8 L8,0 L16,8 Z M16,8",
          fill: am5.color(0xffffff),
        }),
      }),
      0
    );

    homeButton.events.on("click", () => {
      if (currentDataItem) {
        countrySeries.zoomToDataItem(currentDataItem);
      } else {
        chart.goHome();
      }
    });

    return root;
  }
}
