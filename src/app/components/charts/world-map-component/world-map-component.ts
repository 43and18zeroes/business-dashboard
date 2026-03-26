import { Component, effect, ElementRef, inject } from '@angular/core';
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5geodata_worldLow from "@amcharts/amcharts5-geodata/worldLow";
import { ColorService } from '../../../services/color-service';
import { ThemeService } from '../../../services/theme-service';
import { ChartsThemeService } from '../charts-theme-service';

interface TooltipStyle {
  textColor: string;
  backgroundColor: string;
  borderColor: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  padding: number;
  cornerRadius: number;
  borderWidth: number;
}

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
  private polygonSeries!: am5map.MapPolygonSeries;
  private tooltip!: am5.Tooltip;
  private tooltipStyle!: TooltipStyle;

  constructor() {
    effect(() => {
      const isDark = this.themeService.darkMode();
      const tokens = this.colorService.tokens();
      const chartTheme = this.chartsThemeService.getTheme(isDark);

      this.tooltipStyle = this.buildTooltipStyle(isDark, chartTheme);
      this.applyTooltipStyle();
      this.updatePolygonColors(tokens.primary, tokens.secondary);
    });
  }

  ngAfterViewInit(): void {
    const isDark = this.themeService.darkMode();
    const chartTheme = this.chartsThemeService.getTheme(isDark);
    const tooltipSpec = this.chartsThemeService.getTooltipsSpec();

    this.tooltipStyle = this.buildTooltipStyle(isDark, chartTheme, tooltipSpec);

    this.root = am5.Root.new("chartdiv");
    const chart = this.createMapChart(this.root);
    this.polygonSeries = this.createPolygonSeries(chart);
    this.tooltip = this.createTooltip(this.root);

    this.registerChartEvents(chart);
    this.configurePolygonTemplate();

    const initialTokens = this.colorService.tokens();
    this.updatePolygonColors(initialTokens.primary, initialTokens.secondary);
    this.polygonSeries.events.on("datavalidated", () => chart.goHome());
  }

  ngOnDestroy(): void {
    this.root?.dispose();
  }

  private buildTooltipStyle(isDark: boolean, chartTheme: any, spec = this.chartsThemeService.getTooltipsSpec()): TooltipStyle {
    return {
      textColor: chartTheme.textColor,
      borderColor: chartTheme.axisColor,
      backgroundColor: isDark ? "#37383a" : "#f3f4f5",
      fontFamily: spec.ttTitleFont,
      fontSize: spec.ttTitleSize,
      fontWeight: spec.ttTitleWeight.toString(),
      padding: spec.ttPadding,
      cornerRadius: spec.ttCornerRadius,
      borderWidth: spec.ttBorderWidth,
    };
  }

  private createMapChart(root: am5.Root): am5map.MapChart {
    return root.container.children.push(
      am5map.MapChart.new(root, {
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
        centerMapOnZoomOut: true,
      })
    );
  }

  private createPolygonSeries(chart: am5map.MapChart): am5map.MapPolygonSeries {
    return chart.series.push(
      am5map.MapPolygonSeries.new(this.root, {
        geoJSON: am5geodata_worldLow,
        exclude: ["AQ"],
      })
    );
  }

  private createTooltip(root: am5.Root): am5.Tooltip {
    const { padding, cornerRadius, fontFamily, fontSize, fontWeight, backgroundColor, borderColor } = this.tooltipStyle;

    const tooltip = am5.Tooltip.new(root, {
      getFillFromSprite: false,
      pointerOrientation: "horizontal",
      animationDuration: 160,
      animationEasing: am5.ease.out(am5.ease.cubic),
    });

    tooltip.setAll({
      paddingTop: padding,
      paddingRight: padding,
      paddingBottom: padding,
      paddingLeft: padding,
    });

    tooltip.set("background", am5.RoundedRectangle.new(root, {
      cornerRadiusTL: cornerRadius,
      cornerRadiusTR: cornerRadius,
      cornerRadiusBL: cornerRadius,
      cornerRadiusBR: cornerRadius,
      fill: am5.color(backgroundColor),
      stroke: am5.color(borderColor),
      strokeWidth: 1.5,
    }));

    tooltip.label.setAll({
      fontFamily,
      fontSize,
      fontWeight: fontWeight as any,
    });

    tooltip.label.adapters.add("fill", () => am5.color(this.tooltipStyle.textColor));
    tooltip.states.create("hidden", { opacity: 0, scale: 0.92 });
    tooltip.states.create("default", { opacity: 1, scale: 1 });

    return tooltip;
  }

  private registerChartEvents(chart: am5map.MapChart): void {
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
  }

  private configurePolygonTemplate(): void {
    this.polygonSeries.mapPolygons.template.setAll({
      tooltip: this.tooltip,
      tooltipText: "{name}",
      interactive: true,
      templateField: "polygonSettings",
      stateAnimationDuration: 200,
      stateAnimationEasing: am5.ease.out(am5.ease.cubic),
    });

    this.polygonSeries.mapPolygons.template.states.create("hover", {});
  }

  private applyTooltipStyle(): void {
    if (!this.tooltip) return;

    const { backgroundColor, borderColor } = this.tooltipStyle;
    const background = this.tooltip.get("background");

    background?.setAll({
      fill: am5.color(backgroundColor),
      stroke: am5.color(borderColor),
    });

    this.tooltip.label.markDirty();
  }

  private updatePolygonColors(primary: string, secondary: string): void {
    if (!this.polygonSeries) return;

    const primaryColor = am5.color(primary);
    const secondaryColor = am5.color(secondary);
    const strokeColor = this.resolveStrokeColor();

    this.polygonSeries.mapPolygons.template.set("fill", primaryColor);
    this.polygonSeries.mapPolygons.template.set("stroke", strokeColor);

    const hoverTemplate = this.polygonSeries.mapPolygons.template.states.lookup("hover");
    if (hoverTemplate) {
      hoverTemplate.set("fill", secondaryColor);
    }

    this.applyTooltipStyle();

    this.polygonSeries.mapPolygons.each((polygon) => {
      polygon.set("fill", primaryColor);
      polygon.set("stroke", strokeColor);

      const hoverState = polygon.states.lookup("hover");
      hoverState?.set("fill", secondaryColor);

      const defaultState = polygon.states.lookup("default");
      if (defaultState) {
        defaultState.set("fill", primaryColor);
      } else {
        polygon.states.create("default", { fill: primaryColor });
      }
    });
  }

  private resolveStrokeColor(): am5.Color {
    const isDark = this.themeService.darkMode();
    const fallback = isDark ? '#343a40' : '#f2f3f4';
    const resolved = this.chartsThemeService.getColorFromCssVar('--bg-color', isDark, fallback);
    return am5.color(resolved);
  }
}