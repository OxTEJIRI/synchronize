/** Coarse continent outlines as [lon, lat]. Enough for a silhouette, not a atlas. */
const LAND: [number, number][][] = [
  // North America
  [[-168,66],[-156,71],[-130,70],[-95,72],[-80,70],[-62,60],[-56,52],[-66,45],[-76,38],[-81,31],[-80,25],[-84,30],[-90,29],[-97,26],[-97,20],[-88,21],[-83,10],[-78,8],[-80,8],[-92,15],[-105,20],[-110,24],[-117,32],[-124,40],[-124,48],[-135,58],[-150,60],[-165,60]],
  // Greenland
  [[-73,78],[-55,82],[-30,83],[-20,75],[-22,70],[-42,60],[-50,64],[-58,75]],
  // South America
  [[-78,8],[-70,12],[-60,10],[-50,0],[-35,-6],[-38,-15],[-48,-26],[-58,-38],[-66,-46],[-70,-54],[-74,-50],[-73,-38],[-71,-25],[-70,-18],[-76,-14],[-81,-5],[-80,2]],
  // Africa
  [[-17,21],[-10,30],[-5,36],[10,37],[20,32],[32,31],[35,28],[43,12],[51,12],[40,-2],[40,-15],[35,-25],[27,-34],[18,-34],[12,-18],[9,-2],[8,4],[-8,4],[-17,14]],
  // Eurasia
  [[-10,36],[-9,43],[-2,44],[-4,48],[2,51],[8,54],[10,58],[5,62],[15,69],[28,71],[45,68],[60,70],[80,73],[105,77],[140,72],[170,70],[180,66],[165,60],[155,58],[142,52],[135,44],[128,38],[122,40],[122,30],[110,21],[106,10],[100,13],[103,1],[98,8],[92,20],[80,14],[77,8],[72,20],[66,25],[57,25],[52,16],[45,13],[38,22],[35,30],[28,36],[36,37],[27,41],[22,40],[15,45],[8,44],[-1,37]],
  // Britain
  [[-5,50],[1,51],[-2,57],[-5,58],[-6,54]],
  // Japan
  [[130,32],[135,35],[140,41],[142,44],[141,38],[136,34]],
  // Australia
  [[114,-22],[122,-18],[130,-12],[137,-12],[142,-11],[146,-19],[153,-26],[150,-37],[141,-38],[131,-31],[115,-34]],
];

/** SVG path data for the map, projected equirectangular into a `w` x `w/2` box. */
export function worldMapPath(w: number): string {
  const h = w / 2;
  return LAND.map(
    (poly) =>
      poly
        .map(([lon, lat], i) => {
          const x = ((lon + 180) / 360) * w;
          const y = ((90 - lat) / 180) * h;
          return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
        })
        .join("") + "Z",
  ).join("");
}

/* ---------- dot-matrix renderers ---------- */

function inPoly(lon: number, lat: number, poly: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export function isLand(lon: number, lat: number): boolean {
  return LAND.some((p) => inPoly(lon, lat, p));
}

const f = (n: number) => n.toFixed(1);

/** Land as dots on a flat map, `w` wide and `w/2` tall. Draw with a round-capped stroke. */
export function flatDots(w: number, step = 4): string {
  let d = "";
  for (let lat = 82; lat >= -58; lat -= step) {
    for (let lon = -180; lon < 180; lon += step) {
      if (isLand(lon, lat)) d += `M${f(((lon + 180) / 360) * w)} ${f(((90 - lat) / 180) * (w / 2))}h0`;
    }
  }
  return d;
}

/** Flat graticule every 30 degrees. */
export function flatGrid(w: number): string {
  const h = w / 2;
  let d = "";
  for (let lon = -180; lon <= 180; lon += 30) d += `M${f(((lon + 180) / 360) * w)} 0V${f(h)}`;
  for (let lat = -60; lat <= 60; lat += 30) d += `M0 ${f(((90 - lat) / 180) * h)}H${f(w)}`;
  return d;
}

/** Orthographic globe centred on (lon0, lat0), radius R, around the origin. */
export function globe(lon0: number, lat0: number, R: number, step = 3.4) {
  const rad = Math.PI / 180;
  const p0 = lat0 * rad;
  const proj = (lon: number, lat: number) => {
    const phi = lat * rad;
    const lam = (lon - lon0) * rad;
    const c = Math.sin(p0) * Math.sin(phi) + Math.cos(p0) * Math.cos(phi) * Math.cos(lam);
    return {
      vis: c > 0.03,
      x: R * Math.cos(phi) * Math.sin(lam),
      y: -R * (Math.cos(p0) * Math.sin(phi) - Math.sin(p0) * Math.cos(phi) * Math.cos(lam)),
    };
  };

  let land = "";
  for (let lat = 84; lat >= -60; lat -= step) {
    const ls = step / Math.max(Math.cos(lat * rad), 0.35);
    for (let lon = -180; lon < 180; lon += ls) {
      if (!isLand(lon, lat)) continue;
      const p = proj(lon, lat);
      if (p.vis) land += `M${f(p.x)} ${f(p.y)}h0`;
    }
  }

  let grid = "";
  const line = (pts: [number, number][]) => {
    let pen = false;
    for (const [lon, lat] of pts) {
      const p = proj(lon, lat);
      if (!p.vis) pen = false;
      else {
        grid += `${pen ? "L" : "M"}${f(p.x)} ${f(p.y)}`;
        pen = true;
      }
    }
  };
  for (let lon = -180; lon < 180; lon += 30) {
    line(Array.from({ length: 73 }, (_, i) => [lon, -90 + i * 2.5] as [number, number]));
  }
  for (let lat = -60; lat <= 60; lat += 30) {
    line(Array.from({ length: 145 }, (_, i) => [-180 + i * 2.5, lat] as [number, number]));
  }
  return { land, grid };
}
