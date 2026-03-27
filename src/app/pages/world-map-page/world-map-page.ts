import { Component, inject } from '@angular/core';
import { WorldMapComponent } from "../../components/charts/world-map-component/world-map-component";
import { DeviceService } from '../../services/device-service';

@Component({
  selector: 'app-world-map-page',
  imports: [WorldMapComponent],
  templateUrl: './world-map-page.html',
  styleUrl: './world-map-page.scss',
})
export class WorldMapPage {
  readonly deviceService = inject(DeviceService);
}
