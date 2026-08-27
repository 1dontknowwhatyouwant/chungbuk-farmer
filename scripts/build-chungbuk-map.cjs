// Regenerate from the KOSTAT 2018 GeoJSON documented in map-source.md.
// Usage: node scripts/build-chungbuk-map.cjs <downloaded-geojson>
const fs = require('node:fs');
const path = require('node:path');
const features = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')).features.filter(f => f.properties.code.startsWith('33'));
const project = ([x, y]) => [x * Math.cos(36.7 * Math.PI / 180), -y];
const points = features.flatMap(f => f.geometry.coordinates.flat(2)).map(project);
const minX = Math.min(...points.map(p => p[0])), minY = Math.min(...points.map(p => p[1]));
const scale = Math.min(330 / (Math.max(...points.map(p => p[0])) - minX), 360 / (Math.max(...points.map(p => p[1])) - minY));
const screen = p => { const [x,y] = project(p); return [(x-minX)*scale+15,(y-minY)*scale+15]; };
const regions = new Map();
for (const feature of features) {
  const name = feature.properties.name.startsWith('청주시') ? '청주시' : feature.properties.name;
  const region = regions.get(name) || {name, paths:[], points:[]};
  for (const polygon of feature.geometry.coordinates) {
    region.paths.push(polygon.map(ring => {
      const outline = ring.map(screen);
      const simplified = [outline[0]];
      for (const point of outline.slice(1)) {
        const previous = simplified[simplified.length-1];
        if (Math.hypot(point[0]-previous[0],point[1]-previous[1]) > 0.6) simplified.push(point);
      }
      // Keep ring closure even for a very short segment.
      return simplified.map((p,i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')+'Z';
    }).join(' '));
    region.points.push(...polygon[0].map(screen));
  }
  regions.set(name,region);
}
const output = [...regions.values()].map(({name,paths,points}) => ({name, paths, label:[+((Math.min(...points.map(p=>p[0]))+Math.max(...points.map(p=>p[0])))/2).toFixed(1),+((Math.min(...points.map(p=>p[1]))+Math.max(...points.map(p=>p[1])))/2).toFixed(1)]}));
fs.writeFileSync(path.join(__dirname,'../src/components/CenterMetricsPage/chungbuk-map.json'),JSON.stringify(output));
console.log(output.map(({name,label})=>({name,label})));
