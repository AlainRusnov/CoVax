import React from "react";
import DeckGL from "deck.gl";
import { StaticMap } from 'react-map-gl';
import axios from "axios";
import { RenderLayers } from "./deck.gl-layer.jsx";
import _ from "lodash";
import Modal from "./Modal";


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
let iso;

export default class App extends React.Component {
  state = {};
  constructor(props) {
    super();
    this.state = {
      data: [],
      click: {
        clickedObject: null
      },
      hover: {
        x: 0,
        y: 0,
        hoveredObject: null
      }
    };
  }

  closeModal = () => {
    this.setState({
      click: {
        clickedObject: null
      },
      render: false
    });
  }

  renderLocation({ object, layer }) {
    this.setState({ click: { layer, clickedObject: object } });

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
          clickable: true,
        };
      });


      let WorldData = World.data || [];
      // data = WorldData;

      WorldData = WorldData.map(function (location) {
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
      // for (iso in vaxData) {
      //   if (vaxData.hasOwnProperty(iso) && vaxData[iso] === /([OWID])\w+/g) {
      //     delete vaxData[iso];
      //   }
      // }
      // const vaxInfo = vaxData.filter(location => { return (location.iso !== "SHN" ) || (location.iso !== "GGY")});
      // console.log(vaxInfo);
      // data = data.filter(location => (location.continent === "Europe"));
      // data = WorldData.concat(vaxData);
      // data = Object.assign(vaxData, WorldData);
      // data = {...WorldData, ...vaxData}
      // data = _.merge(WorldData, vaxData);


      var merged = _.merge(_.keyBy(WorldData, 'iso'), _.keyBy(vaxData, 'iso'));
      var data = _.values(merged);
      data.splice(220, 9e9);
      console.log(data);
      this.setState({ data: data });
    })).catch((error) => {
      console.log(error); return [];
    })
  }
  render() {
    const { hover, click, data } = this.state;
    // console.log(data);
    return (
      <div>
        {click.clickedObject && (
          <div>
            {click.clickedObject.clickable && (
              <Modal closeModal={this.closeModal} modelState={"true"}>
              <h1>CoVax</h1>
              {console.log("MODAL !!")}
              </Modal>
            )}
          </div>
        )}
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
              <li>People with 1 vaccination: <span>{hover.hoveredObject.vaxCount && hover.hoveredObject.vaxCount.people_vaccinated? hover.hoveredObject.vaxCount.people_vaccinated.toLocaleString() : "N/A"}</span></li>
              <li>People Fully vaccinated: <span>{hover.hoveredObject.vaxCount && hover.hoveredObject.vaxCount.people_fully_vaccinated? hover.hoveredObject.vaxCount.people_fully_vaccinated.toLocaleString() : "N/A"}</span></li>
              <li>Total Vaccinations: <span>{hover.hoveredObject.vaxCount? hover.hoveredObject.vaxCount.total_vaccinations.toLocaleString() : "N/A"}</span></li>
              <li>updated: <span>{hover.hoveredObject.updated}</span></li>
            </ul>
          </div>
          )
        }
        <DeckGL layers={RenderLayers({ data: data, onHover: hover => this.renderTooltip(hover), onClick: click => this.renderLocation(click)})} initialViewState={INITIAL_VIEW_STATE} controller={true} ><StaticMap mapStyle={mapStyle} mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN} />
        </DeckGL>
      </div>

    );
  }
}