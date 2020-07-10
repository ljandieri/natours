/* eslint-disable */

export const displayMap = (locations) => {
   mapboxgl.accessToken = 'pk.eyJ1IjoibGVqYW4iLCJhIjoiY2tjNjlxZHRmMDljMjMybnhnZ3VmdDRocCJ9.f-bfSk2Cf8kNWsssT4DAHQ';

   var map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/lejan/ckc69wku9130o1jp5odqlt2z5',
      scrollZoom: false,
      // center: [-118, 34],
      // zoom: 4,
      // interactive: false,
   });

   const bounds = new mapboxgl.LngLatBounds();

   locations.forEach(loc => {
      // create marker
      const el = document.createElement('div');
      el.className = 'marker';
      // add marker
      new mapboxgl.Marker({
         element: el,
         anchor: 'bottom',
      }).setLngLat(loc.coordinates).addTo(map);
      // add pop-up
      new mapboxgl.Popup({
         offset: 30
      }).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}: ${loc.description} </p`).addTo(map);
      // extend the map bounds to include current location
      bounds.extend(loc.coordinates);
   });

   map.fitBounds(bounds, {
      padding: {
         top: 200,
         bottom: 150,
         left: 100,
         right: 100,
      }
   });
}

