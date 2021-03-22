import React from "react";
import DeckGL from "deck.gl";
import { StaticMap } from 'react-map-gl';
import axios from "axios";
import { RenderLayers } from "./deck.gl-layer.jsx";


const MAPBOX_ACCESS_TOKEN = "pk.eyJ1IjoieW9zbyIsImEiOiJja2d3aHVkMWUwYWZoMzFwbnNxdnhjbmtoIn0.72451mV-JRRnWfaqmz0ZnQ";
const mapStyle = "mapbox://styles/mapbox/dark-v10";
const INITIAL_VIEW_STATE = {
  longitude: 12.8333,
  latitude: 42.8333,
  zoom: 4,
  maxZoom: 20,
  minZoom: 4,
  pitch: 60,
  bearing: 5
};

// let data;

export default class App extends React.Component {
  state = {};
  constructor(props) {
    super();
    this.state = {
      data: [],
      hover: {
        x: 0,
        y: 0,
        hoveredObject: null
      }
    };
  }
  renderTooltip({ x, y, object, layer }) {
    this.setState({ hover: { x, y, layer, hoveredObject: object } });
  }
  componentDidMount() {
    this.fetchData();
  }
  fetchData() {
    axios.all([
      axios.get('https://disease.sh/v2/countries?allowNull=false'),
    ]).then(axios.spread((World) => {
      let data = World.data || [];
      data = data.map(function (location) {
        return {
          active: location.active,
          country: location.country,
          continent: location.continent,
          coordinates: [location.countryInfo.long, location.countryInfo.lat]
        };
      });
      // data = data.filter(location => (location.continent === "Europe"));
      this.setState({ data: data });
    })).catch((error) => {
      console.log(error); return [];
    })
  }
  render() {
    const { hover, data } = this.state;
    console.log(data);
    return (
      <div>
        {hover.hoveredObject && (
          <div style={{
            position: "absolute",
            zIndex: 1000,
            background: "#ffffff",
            pointerEvents: "none",
            borderRadius: "5px",
            left: hover.x,
            top: hover.y
          }} >
            <ul className="hoveredObjectData">
              <li><h4>{hover.hoveredObject.country}</h4></li>
              <li>active cases: <span>{hover.hoveredObject.active.toLocaleString()}</span></li>
            </ul>
          </div>
          )
        }
        <DeckGL layers={RenderLayers({ data: data, onHover: hover => this.renderTooltip(hover)})} initialViewState={INITIAL_VIEW_STATE} controller={true} ><StaticMap mapStyle={mapStyle} mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN} />
        </DeckGL>
      </div>
    );
  }
}