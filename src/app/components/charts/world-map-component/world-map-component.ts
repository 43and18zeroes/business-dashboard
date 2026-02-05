import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  ElementRef,
  Inject,
  Input,
  NgZone,
  PLATFORM_ID,
  ViewChild, } from '@angular/core';

import * as am5 from '@amcharts/amcharts5';
import * as am5map from '@amcharts/amcharts5/map';
import am5geodata_worldLow from '@amcharts/amcharts5-geodata/worldLow';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';

@Component({
  selector: 'app-world-map-component',
  imports: [],
  templateUrl: './world-map-component.html',
  styleUrl: './world-map-component.scss',
})
export class WorldMapComponent {
  @ViewChild('chartDiv', { static: true }) chartDiv!: ElementRef<HTMLDivElement>;

  @Input() drilldownMaps: Record<string, string> = {
    US: 'usaLow.json',
    CA: 'canadaLow.json',
    MX: 'mexicoLow.json',
  };

  @Input() height = '420px';

  private root?: am5.Root;

  constructor(
    private zone: NgZone,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.zone.runOutsideAngular(() => this.createChart());
  }

  ngOnDestroy(): void {
    this.root?.dispose();
    this.root = undefined;
  }

  private createChart(): void {
    const root = am5.Root.new(this.chartDiv.nativeElement);
    this.root = root;

    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: 'translateX',
        panY: 'translateY',
        wheelX: 'none',
        wheelY: 'none',
        projection: am5map.geoNaturalEarth1(),
      })
    );

    const worldSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_worldLow as any,
        exclude: ['AQ'],
      })
    );

    worldSeries.mapPolygons.template.setAll({
      tooltipText: '{name}',
      interactive: true,
    });

    worldSeries.mapPolygons.template.states.create('hover', {
      fill: root.interfaceColors.get('primaryButtonActive'),
    });

    worldSeries.mapPolygons.template.adapters.add('fill', (fill, target) => {
      const id = target.dataItem?.get('id');
      if (id && this.drilldownMaps[id]) {
        return root.interfaceColors.get('primaryButtonHover');
      }
      return fill;
    });

    const countrySeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        visible: false,
      })
    );

    countrySeries.mapPolygons.template.setAll({
      tooltipText: '{name}',
      interactive: true,
    });

    countrySeries.mapPolygons.template.states.create('hover', {
      fill: root.interfaceColors.get('primaryButtonActive'),
    });

    const homeButton = chart.children.push(
      am5.Button.new(root, {
        paddingTop: 10,
        paddingBottom: 10,
        x: am5.percent(100),
        centerX: am5.percent(100),
        opacity: 0,
        interactiveChildren: false,
        icon: am5.Graphics.new(root, {
          svgPath:
            'M16,8 L14,8 L14,16 L10,16 L10,10 L6,10 L6,16 L2,16 L2,8 L0,8 L8,0 L16,8 Z M16,8',
          fill: am5.color(0xffffff),
        }),
      })
    );

    homeButton.events.on('click', () => {
      chart.goHome();
      countrySeries.hide();
      worldSeries.show();
      homeButton.hide();
    });

    worldSeries.mapPolygons.template.events.on('click', (ev) => {
      const countryId = ev.target.dataItem?.get('id') as string | undefined;
      if (!countryId) return;

      const mapFile = this.drilldownMaps[countryId];
      if (!mapFile) return;

      Promise.all([
        worldSeries.zoomToDataItem(ev.target.dataItem!).waitForStop(),
        am5.net.load(`https://cdn.amcharts.com/lib/5/geodata/json/${mapFile}`, chart),
      ]).then((result) => {
        const response = result[1].response;
        const geodata = am5.JSONParser.parse(response);

        countrySeries.setAll({ geoJSON: geodata });
        countrySeries.show();
        worldSeries.hide();
        homeButton.show();
      });
    });
  }
}

