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

let data;

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
      axios.get('https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/vaccinations/vaccinations.json'),
    ]).then(axios.spread((World, vax) => {

      // let vaxData = vax.data || [];
      // // data = vaxData;
      // // console.log(vaxData);   // FRA.data.total_vaccinations

      // vaxData = vaxData.map(function (vaxData) {
      //   return {
      //     vaxCountry: vaxData.country.data,  // data.total_vaccinations,
      //   };
      // });


      let WorldData = World.data || [];
      data = WorldData;

      data = data.map(function (location) {
        return {
          active: location.active,
          country: location.country,
          continent: location.continent,
          coordinates: [location.countryInfo.long, location.countryInfo.lat],
          flag: location.countryInfo.flag,
          iso: location.countryInfo.iso3
        };

      });
      // data = data.filter(location => (location.continent === "Europe"));
      // data = data.concat(vaxData);
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
            background: "#1D1D1F",
            pointerEvents: "none",
            borderRadius: "5px",
            left: hover.x,
            top: hover.y
          }} >
            <ul className="hoveredObjectData">
              <li><img src={hover.hoveredObject.flag} alt={"flag"} /></li>
              <li><h4>{hover.hoveredObject.country}</h4></li>
              <li>Active cases: <span>{hover.hoveredObject.active.toLocaleString()}</span></li>
              <li>iso code: <span>{hover.hoveredObject.iso}</span></li>
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