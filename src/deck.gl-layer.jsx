import { ColumnLayer } from "deck.gl";
import { scaleLinear } from "d3-scale";

export const RenderLayers = (props) => {
  let maxActive, minActive;
  const radiusColumns = 30000;
  const { data, onHover } = props;
  const value = data.map((a) => a.active);
  maxActive = Math.max(...value);
  minActive = Math.min(...value);
  const elevation = scaleLinear([minActive, maxActive], [1000, 20000]);

  return [
    new ColumnLayer({
    id: "cases",
    data,
    pickable: true,
    extruded: true,
    getPosition: d => d.coordinates,
    diskResolution: 10,
    radius: radiusColumns,
    elevationScale: 100,
    getFillColor: [138, 3, 3],
    getElevation: d => elevation(d.active),
    onHover,
    }),
  ];
}