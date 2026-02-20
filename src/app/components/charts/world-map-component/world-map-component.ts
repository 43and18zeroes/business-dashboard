import { Component, DOCUMENT, effect, ElementRef, inject } from '@angular/core';
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5geodata_worldLow from "@amcharts/amcharts5-geodata/worldLow";
import { ColorService } from '../../../services/color-service';
import { ThemeService } from '../../../services/theme-service';
import { ChartsThemeService } from '../charts-theme-service';
import { ColorTokens } from '../../../services/color.tokens';

@Component({
  selector: 'app-world-map-component',
  imports: [],
  templateUrl: './world-map-component.html',
  styleUrl: './world-map-component.scss',
})
export class WorldMapComponent {
  private readonly colorService = inject(ColorService);
  private readonly themeService = inject(ThemeService);
  private readonly chartsThemeService = inject(ChartsThemeService);
  private root!: am5.Root;
  rootHTML!: ElementRef<HTMLElement>;
  private polygonSeries!: am5map.MapPolygonSeries;
  private tooltip!: am5.Tooltip;
  private readonly doc = inject(DOCUMENT);

  ttTextColor: string = '';
  ttAxisColor: string = '';
  ttBackgroundColor: string = '';
  ttBorderWidth: number = 0;
  ttPadding: number = 0;
  ttCornerRadius: number = 0;
  ttTitleFont: string = '';
  ttTitleSize: number = 0;
  ttTitleWeight: string = '';

  initialTokens!: ColorTokens;

  constructor() {
    effect(() => {
      this.themeService.darkMode();
      const tokens = this.colorService.tokens();
      this.updateMapColors(tokens.primary, tokens.secondary);
    });
  }

  getGlobalStyles() {
    const theme = this.chartsThemeService.getTheme(this.themeService.darkMode());
    this.ttTextColor = theme.textColor;
    this.ttAxisColor = theme.axisColor;
    this.ttBackgroundColor = theme.tooltipBg;

    const { ttBorderWidth, ttPadding, ttCornerRadius, ttTitleFont, ttTitleSize, ttTitleWeight } =
      this.chartsThemeService.getTooltipsSpec();
    this.ttBorderWidth = ttBorderWidth;
    this.ttPadding = ttPadding;
    this.ttCornerRadius = ttCornerRadius;
    this.ttTitleFont = ttTitleFont;
    this.ttTitleSize = ttTitleSize;
    this.ttTitleWeight = ttTitleWeight.toString();

    this.initialTokens = this.colorService.tokens();
  }

  ngAfterViewInit(): void {
    this.getGlobalStyles();
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
      getFillFromSprite: false,
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

    this.tooltip.setAll({
      paddingTop: this.ttPadding,
      paddingRight: this.ttPadding,
      paddingBottom: this.ttPadding,
      paddingLeft: this.ttPadding
    });

    this.tooltip.set("background", am5.RoundedRectangle.new(this.root, {
      cornerRadiusTL: this.ttCornerRadius,
      cornerRadiusTR: this.ttCornerRadius,
      cornerRadiusBL: this.ttCornerRadius,
      cornerRadiusBR: this.ttCornerRadius,
      stroke: am5.color(this.ttAxisColor),
      strokeWidth: this.ttBorderWidth,
    }));

    this.tooltip.label.setAll({
      fontFamily: this.ttTitleFont,
      fontSize: this.ttTitleSize,
      fontWeight: this.ttTitleWeight as any,
    });

    this.tooltip.label.adapters.add("fill", () => am5.color(this.ttTextColor));

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
    this.updateMapColors(this.initialTokens.primary, this.initialTokens.secondary);
    this.polygonSeries.events.on("datavalidated", () => chart.goHome());
  }

  private updateMapColors(primary: string, secondary: string) {
    if (!this.polygonSeries || !this.tooltip) return;

    const primaryColor = am5.color(primary);
    const secondaryColor = am5.color(secondary);

    const isDark = this.themeService.darkMode();
    const fallbackStroke = isDark ? '#343a40' : '#f8f9fa';

    const strokeColor = this.chartsThemeService.getColorFromCssVar(
      '--bg-color',
      isDark,
      fallbackStroke
    );

    const am5Stroke = am5.color(strokeColor);

    this.polygonSeries.mapPolygons.template.set("fill", primaryColor);
    this.polygonSeries.mapPolygons.template.set("stroke", am5Stroke);
    const hoverTemplate = this.polygonSeries.mapPolygons.template.states.lookup("hover");

    // const ttBg = this.chartsThemeService.getColorFromCssVar(
    //   '--elements-tooltip-bg',
    //   isDark,
    //   fallbackStroke
    // );
    // const ttBgColor = am5.color(ttBg);

    this.tooltip.get("background")?.set("fill", am5.color(this.ttBackgroundColor));

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