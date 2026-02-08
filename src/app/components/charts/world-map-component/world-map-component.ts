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
  templateUrl: "./world-map-component.html",
  styleUrl: "./world-map-component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorldMapComponent implements AfterViewInit, OnDestroy {
  private readonly colorService = inject(ColorService);

  @ViewChild("chartdiv", { static: true }) private chartDiv!: ElementRef<HTMLDivElement>;

  // @Input() height: string = "500px";
  @Input() projection: "mercator" | "naturalEarth1" = "mercator";

  private root?: am5.Root;
  private chart?: am5map.MapChart;
  private backContainer?: am5.Container;
  private currentDataItem?: am5.DataItem<am5map.IMapPolygonSeriesDataItem>;

  private worldSeries?: am5map.MapPolygonSeries;
  private countrySeries?: am5map.MapPolygonSeries;

  // --- color helpers ---------------------------------------------------------

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

  private hash01(str: string): number {
    let h = 2166136261; // FNV-1a
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0) / 0xffffffff;
  }

  /**
   * Higher-contrast borders derived from primary:
   * - base border is a strong shade of primary (instead of light grey)
   * - hover border slightly lighter than base border
   */
  private getBorderColors(primaryInt: number) {
    const border = am5.color(this.shadeInt(primaryInt, 0.1)); // darker => more contrast on land
    const borderHover = am5.color(this.shadeInt(primaryInt, 0.2)); // still dark, but distinct
    return { border, borderHover };
  }

  private getZoomLevelSafe(chart?: am5map.MapChart): number {
    // amCharts kann undefined liefern, gerade beim Start
    return chart?.get("zoomLevel") ?? 1;
  }

  /**
   * Adaptive border width:
   * - thicker on world view (zoomed out)
   * - slightly thinner when zoomed in
   */
  private updateBorderWidthForZoom(zoomLevel: number) {
    const w = this.worldSeries?.mapPolygons.template;
    const c = this.countrySeries?.mapPolygons.template;
    if (!w) return;

    // Smooth-ish mapping (tweak values to taste)
    // zoomLevel ~1 => ~1.0px, zoomLevel ~4 => ~0.55px
    const width = Math.max(0.55, Math.min(1.0, 1.05 - (zoomLevel - 1) * 0.17));

    w.setAll({ strokeWidth: width });
    c?.setAll({ strokeWidth: width });
  }

  private countryFill(
    countryId: string,
    continentCode: string,
    primaryInt: number,
    secondaryInt: number
  ): am5.Color {
    const continents: Record<string, number> = { AF: 0, AN: 1, AS: 2, EU: 3, NA: 4, OC: 5, SA: 6 };
    const idx = continents[continentCode] ?? 3;

    const baseMixByContinent = [0.12, 0.22, 0.32, 0.42, 0.52, 0.62, 0.72];
    let mixAmount = baseMixByContinent[idx];

    const h = this.hash01(countryId);
    mixAmount = this.clamp01(mixAmount + (h - 0.5) * 0.22);

    const mixed = this.mixInt(primaryInt, secondaryInt, mixAmount);

    // Slightly reduced jitter -> less “samey”, but also avoids too-light countries
    const lightJitter = (h - 0.5) * 0.22;
    const finalInt =
      lightJitter >= 0 ? this.tintInt(mixed, lightJitter) : this.shadeInt(mixed, -lightJitter);

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
    // this.chartDiv.nativeElement.style.height = this.height;

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
    if (!this.worldSeries || !this.chart) return;

    const primary = am5.color(primaryInt);
    const secondary = am5.color(secondaryInt);

    const { border, borderHover } = this.getBorderColors(primaryInt);

    // Keep hover fill but improve border contrast on hover too
    this.worldSeries.mapPolygons.template.states.lookup("hover")?.setAll({
      fill: secondary,
      stroke: borderHover,
      strokeOpacity: 0.9,
    });
    this.countrySeries?.mapPolygons.template.states.lookup("hover")?.setAll({
      fill: secondary,
      stroke: borderHover,
      strokeOpacity: 0.9,
    });

    // Base styles: darker borders + higher opacity for clear country separation
    this.worldSeries.mapPolygons.template.setAll({
      fill: primary,
      stroke: border,
      strokeOpacity: 0.75,
    });
    this.countrySeries?.mapPolygons.template.setAll({
      fill: primary,
      stroke: border,
      strokeOpacity: 0.75,
    });

    // Re-apply individual country fills (unchanged concept, just via helper)
    this.worldSeries.data.each((d: any) => {
      d.polygonSettings = {
        ...(d.polygonSettings ?? {}),
        fill: this.countryFill(d.id, d.continent_code, primaryInt, secondaryInt),
      };
    });

    // Force refresh
    const values = this.worldSeries.data.values;
    this.worldSeries.data.setAll(values);

    // Update border width based on current zoom for best legibility
    this.updateBorderWidthForZoom(this.getZoomLevelSafe(this.chart));
  }

  private createChart(
    container: HTMLDivElement,
    tokens: { primaryInt: number; secondaryInt: number }
  ): am5.Root {
    const primary = am5.color(tokens.primaryInt);
    const secondary = am5.color(tokens.secondaryInt);
    const { border: borderColor, borderHover: borderHoverColor } = this.getBorderColors(tokens.primaryInt);

    const root = am5.Root.new(container);
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: "rotateX",
        projection: this.projection === "naturalEarth1" ? am5map.geoNaturalEarth1() : am5map.geoMercator(),
        homeZoomLevel: 2,
        homeGeoPoint: { latitude: 20, longitude: 0 }
      })
    );
    this.chart = chart;

    chart.on("zoomLevel", (zl) => {
      this.updateBorderWidthForZoom(zl ?? 1);
    });

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

      // CONTRAST FIX: darker borders + higher opacity + slightly thicker base
      stroke: borderColor,
      strokeOpacity: 0.75,
      strokeWidth: 1.0,
    });

    worldSeries.mapPolygons.template.states.create("hover", {
      fill: secondary,
      stroke: borderHoverColor,
      strokeOpacity: 0.9,
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
      stroke: borderColor,
      strokeOpacity: 0.75,
      strokeWidth: 1.0,
    });

    countrySeries.mapPolygons.template.states.create("hover", {
      fill: secondary,
      stroke: borderHoverColor,
      strokeOpacity: 0.9,
    });

    const data: Array<any> = [];
    const countries2 = am5geodata_data_countries2 as unknown as Record<string, Countries2Entry>;

    for (const id in countries2) {
      if (!Object.prototype.hasOwnProperty.call(countries2, id)) continue;
      const country = countries2[id];
      if (!country?.maps?.length) continue;

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

    worldSeries.events.once("datavalidated", () => {
      chart.goHome();
    });

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

    worldSeries.mapPolygons.template.events.on("click", (ev) => {
      const dataItem = ev.target.dataItem;
      if (!dataItem) return;

      const ctx = dataItem.dataContext as any;
      if (!ctx?.map) return;

      this.currentDataItem = dataItem as unknown as am5.DataItem<am5map.IMapPolygonSeriesDataItem>;

      const zoomAnimation = worldSeries.zoomToDataItem(this.currentDataItem);

      Promise.all([
        zoomAnimation?.waitForStop() ?? Promise.resolve(),
        am5.net.load(`https://cdn.amcharts.com/lib/5/geodata/json/${ctx.map}.json`, chart),
      ]).then((results) => {
        const geodata = am5.JSONParser.parse((results[1] as any).response);

        countrySeries.setAll({ geoJSON: geodata });

        // Preserve per-country fill when zoomed into a country map,
        // but keep high-contrast strokes
        countrySeries.mapPolygons.template.setAll({
          fill: ctx.polygonSettings?.fill || primary,
          stroke: borderColor,
          strokeOpacity: 0.75,
        });

        countrySeries.show();
        worldSeries.hide(100);
        backContainer.show();
        chart.set("minZoomLevel", this.getZoomLevelSafe(chart));

        this.updateBorderWidthForZoom(this.getZoomLevelSafe(chart));
      });
    });

    backContainer.events.on("click", () => {
      chart.set("minZoomLevel", 1);
      chart.goHome();
      worldSeries.show();
      countrySeries.hide();
      backContainer.hide();
      this.currentDataItem = undefined;

      this.updateBorderWidthForZoom(this.getZoomLevelSafe(chart));
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

    // Ensure initial adaptive width
    this.updateBorderWidthForZoom(this.getZoomLevelSafe(chart));

    return root;
  }
}
