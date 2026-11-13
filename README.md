# gal_yaakov

A small website about the Gal Yaakov site: an interactive 3D map and a photo page.

## Pages

- `index.html` – the 3D map
- `gallery.html` – photos

## Where things live

| To change… | Edit |
|---|---|
| Built-in pins, roads, houses, elevation data | `js/data.js` |
| Farm buildings (barn, silo, caravans…) | `js/farm.js` |
| Army post and neighbouring houses | `js/surroundings.js` |
| Trees, scrub, rocks | `js/vegetation.js` |
| Ground, contour lines, road drawing | `js/terrain.js` |
| Adding / renaming / removing pins | `js/pins.js` |
| Camera, contour numbers, satellite layer | `js/ui.js` |
| Sky and lighting | `js/sky.js` |
| Shared setup and helpers | `js/core.js` |
| Look of the map page / photo page | `css/map.css`, `css/gallery.css` |
| Photos | `img/` and the list in `gallery.html` |

Coordinates in the code are metres from the sheep barn (32.0048° N, 35.1005° E): `x` is east, `n` is north.

The ground is real elevation data for the 2 km square around the farm. Roads follow OpenStreetMap; neighbouring houses follow satellite imagery; the farm's own buildings are placed from photos and are approximate.
