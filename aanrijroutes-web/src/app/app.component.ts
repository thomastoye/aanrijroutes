import { Component } from '@angular/core';

type Marker = {
  lat: number
  lng: number
  draggable: boolean
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Aanrijroutes';
  lat = 51.05467898167528;
  lng = 3.7257560729602623;

  markers: Marker[] = [
	  {
		  lat: 51.05467898167528,
		  lng: 3.7257560729602623,
		  draggable: true
	  }
  ]

  mapClicked($event:  { coords: { lat: number, lng: number } }) {
    this.markers.push({
      lat: $event.coords.lat,
      lng: $event.coords.lng,
      draggable: true
    });
  }

  markerClicked(i: number) {
    this.markers = this.markers.filter((_, idx) => idx !== i)
  }
}
