import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
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
import { ColorService } from "../../../services/color-service";

type Countries2Entry = {
  continent_code: "AF" | "AN" | "AS" | "EU" | "NA" | "OC" | "SA";
  maps: string[];
};

@Component({
  selector: "app-world-map",
  standalone: true,
  templateUrl: './world-map-component.html',
  styleUrl: './world-map-component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorldMapComponent implements AfterViewInit, OnDestroy {
  private readonly colorService = inject(ColorService);

  @ViewChild("chartdiv", { static: true }) private chartDiv!: ElementRef<HTMLDivElement>;

  @Input() height: string = "500px";
  @Input() projection: "mercator" | "naturalEarth1" = "mercator";

  private root?: am5.Root;
  private chart?: am5map.MapChart;
  private backContainer?: am5.Container;
  private currentDataItem?: am5.DataItem<am5map.IMapPolygonSeriesDataItem>;

  private worldSeries?: am5map.MapPolygonSeries;
  private countrySeries?: am5map.MapPolygonSeries;

  private toRgbInt(hex: number) {
    return { r: (hex >> 16) & 255, g: (hex >> 8) & 255, b: hex & 255 };
  }

  private toHexInt(r: number, g: number, b: number) {
    return (r << 16) | (g << 8) | b;
  }

  private mixInt(base: number, target: number, amount: number): number {
    const b = this.toRgbInt(base);
    const t = this.toRgbInt(target);

    const r = Math.round(b.r + (t.r - b.r) * amount);
    const g = Math.round(b.g + (t.g - b.g) * amount);
    const bb = Math.round(b.b + (t.b - b.b) * amount);

    return this.toHexInt(r, g, bb);
  }

  private tintInt(base: number, amount: number): number {
    return this.mixInt(base, 0xffffff, amount);
  }

  private shadeInt(base: number, amount: number): number {
    return this.mixInt(base, 0x000000, amount);
  }

  private hexStringToInt(hex: string): number {
    return Number(`0x${hex.replace("#", "")}`);
  }

  private clamp01(v: number) {
    return Math.max(0, Math.min(1, v));
  }

  // stabiler Hash -> 0..1 (deterministisch pro Länder-ID)
  private hash01(str: string): number {
    let h = 2166136261; // FNV-1a
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    // >>> unsigned
    return (h >>> 0) / 0xffffffff;
  }

  private countryFill(
    countryId: string,
    continentCode: string,
    primaryInt: number,
    secondaryInt: number
  ): am5.Color {
    // Kontinent bekommt grobe Mischung primary->secondary
    const continents: Record<string, number> = { AF: 0, AN: 1, AS: 2, EU: 3, NA: 4, OC: 5, SA: 6 };
    const idx = continents[continentCode] ?? 3;

    // Basis-Mix pro Kontinent (breitere Streuung als vorher)
    const baseMixByContinent = [0.12, 0.22, 0.32, 0.42, 0.52, 0.62, 0.72]; // 0=mehr primary, 1=mehr secondary
    let mixAmount = baseMixByContinent[idx];

    // pro Land: kleiner zusätzlicher Mix-Offset (macht es weniger “blockig”)
    const h = this.hash01(countryId);
    mixAmount = this.clamp01(mixAmount + (h - 0.5) * 0.22); // +-0.11

    // erst primary<->secondary mischen
    const mixed = this.mixInt(primaryInt, secondaryInt, mixAmount);

    // dann leichte Helligkeitsvariation pro Land (feiner Grain)
    const lightJitter = (h - 0.5) * 0.28; // +-0.14
    const finalInt =
      lightJitter >= 0
        ? this.tintInt(mixed, lightJitter)
        : this.shadeInt(mixed, -lightJitter);

    return am5.color(finalInt);
  }

  constructor(private zone: NgZone) {
    effect(() => {
      const tokens = this.colorService.tokens();

      if (!this.root) return;

      const p = this.hexStringToInt(tokens.primary);
      const s = this.hexStringToInt(tokens.secondary);

      this.zone.runOutsideAngular(() => {
        this.applyThemeToChart(p, s);
      });
    });
  }

  ngAfterViewInit(): void {
    this.chartDiv.nativeElement.style.height = this.height;

    this.zone.runOutsideAngular(() => {
      const t = this.colorService.tokens();
      const primaryInt = this.hexStringToInt(t.primary);
      const secondaryInt = this.hexStringToInt(t.secondary);

      this.root = this.createChart(this.chartDiv.nativeElement, { primaryInt, secondaryInt });
    });
  }

  ngOnDestroy(): void {
    this.zone.runOutsideAngular(() => {
      this.root?.dispose();
      this.root = undefined;
    });
  }

  private applyThemeToChart(primaryInt: number, secondaryInt: number) {
    if (!this.worldSeries) return;

    const primary = am5.color(primaryInt);
    const secondary = am5.color(secondaryInt);

    this.worldSeries.mapPolygons.template.states.lookup("hover")?.setAll({ fill: secondary });
    this.countrySeries?.mapPolygons.template.states.lookup("hover")?.setAll({ fill: secondary });

    this.worldSeries.mapPolygons.template.setAll({ fill: primary });
    this.countrySeries?.mapPolygons.template.setAll({ fill: primary });

    const continents: Record<string, number> = { AF: 0, AN: 1, AS: 2, EU: 3, NA: 4, OC: 5, SA: 6 };

    const tints = [
      am5.color(this.tintInt(primaryInt, 0.45)),
      am5.color(this.tintInt(primaryInt, 0.30)),
      am5.color(this.tintInt(primaryInt, 0.15)),
      am5.color(primaryInt),
      am5.color(this.shadeInt(primaryInt, 0.10)),
      am5.color(this.shadeInt(primaryInt, 0.20)),
      am5.color(this.shadeInt(primaryInt, 0.30)),
    ];

    this.worldSeries.data.each((d: any) => {
      d.polygonSettings = {
        ...(d.polygonSettings ?? {}),
        fill: this.countryFill(d.id, d.continent_code, primaryInt, secondaryInt),
      };
    });

    const values = this.worldSeries.data.values;
    this.worldSeries.data.setAll(values);
  }

  private readCssVar(name: string, fallbackHex: string): am5.Color {
    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();

    const hex = raw || fallbackHex;
    return am5.color(Number(`0x${hex.replace('#', '')}`));
  }

  private createChart(
    container: HTMLDivElement,
    tokens: { primaryInt: number; secondaryInt: number }
  ): am5.Root {
    const primary = am5.color(tokens.primaryInt);
    const secondary = am5.color(tokens.secondaryInt);

    const continents: Record<string, number> = {
      AF: 0,
      AN: 1,
      AS: 2,
      EU: 3,
      NA: 4,
      OC: 5,
      SA: 6,
    };

    const tints = [
      am5.color(this.tintInt(tokens.primaryInt, 0.45)),
      am5.color(this.tintInt(tokens.primaryInt, 0.30)),
      am5.color(this.tintInt(tokens.primaryInt, 0.15)),
      am5.color(tokens.primaryInt),
      am5.color(this.shadeInt(tokens.primaryInt, 0.10)),
      am5.color(this.shadeInt(tokens.primaryInt, 0.20)),
      am5.color(this.shadeInt(tokens.primaryInt, 0.30)),
    ];

    const root = am5.Root.new(container);
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

    this.chart = chart;

    const worldSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_worldLow as any,
        exclude: ["AQ"],
      })
    );
    this.worldSeries = worldSeries;

    worldSeries.mapPolygons.template.setAll({
      tooltipText: "{name}",
      interactive: true,
      fill: primary,
      templateField: "polygonSettings",
    });

    worldSeries.mapPolygons.template.states.create("hover", {
      fill: secondary,
    });

    const countrySeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        visible: false,
      })
    );
    this.countrySeries = countrySeries;

    countrySeries.mapPolygons.template.setAll({
      tooltipText: "{name}",
      interactive: true,
      fill: primary,
    });

    countrySeries.mapPolygons.template.states.create("hover", {
      fill: secondary,
    });

    const data: Array<any> = [];

    const countries2 =
      am5geodata_data_countries2 as unknown as Record<string, Countries2Entry>;

    for (const id in countries2) {
      if (!Object.prototype.hasOwnProperty.call(countries2, id)) continue;

      const country = countries2[id];
      if (!country?.maps?.length) continue;

      const continentIndex = continents[country.continent_code] ?? 3;

      data.push({
        id,
        map: country.maps[0],
        continent_code: country.continent_code,
        polygonSettings: {
          fill: this.countryFill(id, country.continent_code, tokens.primaryInt, tokens.secondaryInt),
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
    this.backContainer = backContainer;

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
        svgPath: "M10 4 L6 8 L10 12 M6 8 L18 8",
      })
    );

    this.currentDataItem = undefined;

    worldSeries.mapPolygons.template.events.on("click", (ev) => {
      const dataItem = ev.target.dataItem;
      if (!dataItem) return;

      const ctx = dataItem.dataContext as any;
      if (!ctx?.map) return;

      this.currentDataItem =
        dataItem as unknown as am5.DataItem<am5map.IMapPolygonSeriesDataItem>;

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
      this.currentDataItem = undefined;
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
      if (this.currentDataItem) {
        countrySeries.zoomToDataItem(this.currentDataItem);
      } else {
        chart.goHome();
      }
    });

    return root;
  }
}