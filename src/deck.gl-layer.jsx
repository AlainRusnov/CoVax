import { ColumnLayer, HexagonLayer } from "deck.gl";
import { scaleLinear, scaleLog } from "d3-scale";

export const RenderLayers = (props) => {
  let maxActive, minActive;
  const radiusColumns = 40000;
  const { data, onHover, onClick } = props;
  const value = data.map((a) => a.active);
  maxActive = Math.max(...value);
  minActive = Math.min(...value);
  const elevation = scaleLinear([minActive, maxActive], [1000, 20000]);

  return [
    new ColumnLayer({
    id: "situation",
    data,
    pickable: true,
    extruded: true,
    getPosition: d => d.coordinates,
    diskResolution: 100,
    radius: radiusColumns,
    elevationScale: 100,
    // wireframe: true,
    // getLineColor: [0, 0, 0],
    // getLineWidth: 20,
    // colorRange: true,
    getFillColor: [127, 3, 3, 255],  ///[48, 128, (d.population / d.active) * 100 * 255, 255],    ///[(d.population / d.active) * 100 * 255, 3, 3],
    getElevation: d => elevation(d.active),
    onHover,
    onClick
    }),
  ];
}