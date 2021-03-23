import React from "react";
import DeckGL from "deck.gl";
import { StaticMap } from 'react-map-gl';
import axios from "axios";
import { RenderLayers } from "./deck.gl-layer.jsx";
import _ from "lodash";


const MAPBOX_ACCESS_TOKEN = "pk.eyJ1IjoieW9zbyIsImEiOiJja2d3aHVkMWUwYWZoMzFwbnNxdnhjbmtoIn0.72451mV-JRRnWfaqmz0ZnQ";
const mapStyle = "mapbox://styles/mapbox/dark-v10";
const INITIAL_VIEW_STATE = {
  longitude: 12.8333,
  latitude: 42.8333,
  zoom: 4,
  maxZoom: 30,
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
      axios.get('https://disease.sh/v3/covid-19/countries?allowNull=false'),
      axios.get('https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/vaccinations/vaccinations.json'), // https://disease.sh/v3/covid-19/vaccine/coverage/countries?lastdays=1 //https://raw.githubusercontent.com/govex/COVID-19/master/data_tables/vaccine_data/global_data/vaccine_data_global.csv
    ]).then(axios.spread((World, vax) => {

      let vaxData = vax.data || [];
      // // data = vaxData
      // console.log(vaxData);   // FRA.data.total_vaccinations

      vaxData = vaxData.map(function (location) {
        return {
          // country: location.country,  // data.total_vaccinations,
          vaxCount: location.data ? (location.data).pop() : "N/A",
          iso: location.iso_code,
        };
      });


      let WorldData = World.data || [];
      data = WorldData;

      data = data.map(function (location) {
        return {
          active: location.active,
          country: location.country,
          continent: location.continent,
          coordinates: [location.countryInfo.long, location.countryInfo.lat],
          flag: location.countryInfo.flag,
          clickable: true,
          iso: location.countryInfo.iso3,
          deaths: location.deaths,
          population: location.population,
          updated: new Date(location.updated).toISOString().substring(0, 10),
          recovered: location.recovered ? location.recovered : "N/A",
        };

      });
      // data = data.filter(location => (location.continent === "Europe"));
      // data = WorldData.concat(vaxData);
      // data = Object.assign(vaxData, WorldData);
      // data = {...WorldData, ...vaxData}
      // data = _.merge(WorldData, vaxData);
      // var merged = _.merge(_.keyBy(WorldData, 'iso'), _.keyBy(vaxData, 'iso'));
      // var data = _.values(merged);
      // console.log(data);
      this.setState({ data: data });
    })).catch((error) => {
      console.log(error); return [];
    })
  }
  render() {
    const { hover, data } = this.state;
    // console.log(data);
    return (
      <div>
        <h1>CoVax</h1>
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
              <li>Recovered: <span>{hover.hoveredObject.recovered.toLocaleString()}</span></li>
              <li>Deaths: <span>{hover.hoveredObject.deaths.toLocaleString()}</span></li>
              <li>Population: <span>{hover.hoveredObject.population.toLocaleString()}</span></li>
              <li>updated: <span>{hover.hoveredObject.updated}</span></li>
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