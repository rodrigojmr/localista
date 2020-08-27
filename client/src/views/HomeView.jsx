import React, { Component } from 'react';
import HomeMap from '../components/Map/HomeMap';
import SearchName from './../components/Search/SearchName';
import PlaceMini from './../components/Place/PlaceMini';
import { nearbyPlaces, localityPlaces } from './../services/place';

class HomeView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      location: null,
      locality: undefined,
      places: [],
      filteredPlaces: [],
      searchQuery: '',
      selectedPlace: null
    };
    this.searchWrapper = React.createRef();
    this.placeInfoWrapper = React.createRef();
  }

  componentDidMount() {
    this.getLocation();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.locality !== this.state.locality) {
      this.getLocalityPlaces(this.state);
    }
  }

  getLocation() {
    navigator.geolocation.getCurrentPosition(
      position => {
        this.setState({
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
        });
      },
      function error(msg) {
        alert('Please enable your GPS position feature.');
      },
      { maximumAge: 10000, timeout: 5000, enableHighAccuracy: true }
    );
  }

  getBoundaryPlaces(boundaries) {
    nearbyPlaces(boundaries).then(data => {
      this.setState({
        places: data.places
      });
    });
    this.handleSearch(this.state.searchQuery);
  }

  getLocalityPlaces() {
    if (this.state.locality) {
      localityPlaces(this.state.locality).then(data => {
        console.log('this.state.locality: ', this.state.locality);
        console.log('places: ', data.places);
        this.setState({
          places: data.places
        });
      });
    }
  }

  handleLocalityUpdate(locality) {
    this.setState({
      locality
    });
  }

  handlePlaceSelection(place) {
    this.setState({
      selectedPlace: place
    });

    const placeInfoWrapper = this.placeInfoWrapper.current;
    if (place) {
      placeInfoWrapper.classList.add('place-info-mini--expanded');
      this.setState({
        location: {
          lat: place.location.coordinates[0],
          lng: place.location.coordinates[1]
        }
      });
    } else {
      placeInfoWrapper.classList.remove('place-info-mini--expanded');
    }
  }

  handleSearch = searchQuery => {
    const filteredPlaces = this.state.places.filter(place =>
      place.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    this.setState({
      searchQuery,
      filteredPlaces
    });
  };

  toggleSearch() {
    const searchWrapper = this.searchWrapper.current;
    searchWrapper.classList.toggle('search-expanded');
  }

  render() {
    const selected = this.state.selectedPlace;

    return (
      <div className='home'>
        <HomeMap
          locality={this.state.locality}
          places={
            this.state.searchQuery
              ? this.state.filteredPlaces
              : this.state.places
          }
          selected={this.state.selectedPlace}
          center={this.state.location}
          handlePlaceSelection={place => this.handlePlaceSelection(place)}
          onLocalityUpdate={locality => this.handleLocalityUpdate(locality)}
          // idleMapSearch={boundaries => this.getBoundaryPlaces(boundaries)}
          idleMapSearch={() => this.getLocalityPlaces()}
        />
        <div ref={this.searchWrapper} className='search-wrapper'>
          <div className='current-locality'>{this.state.locality}</div>

          <svg
            onClick={() => this.toggleSearch()}
            xmlns='http://www.w3.org/2000/svg'
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            stroke-width='2'
            stroke-linecap='round'
            stroke-linejoin='round'
            class='search-icon feather feather-search'
          >
            <circle cx='11' cy='11' r='8'></circle>
            <line x1='21' y1='21' x2='16.65' y2='16.65'></line>
          </svg>
          <SearchName
            handlePlaceSelection={place => this.handlePlaceSelection(place)}
            onSearchUpdate={searchQuery => this.handleSearch(searchQuery)}
            searchQuery={this.state.searchQuery}
            places={this.state.filteredPlaces}
            locality={this.state.locality}
          />
        </div>

        <div ref={this.placeInfoWrapper} className='place-info-mini'>
          {selected && <PlaceMini inMap={true} selected={selected} />}
        </div>
      </div>
    );
  }
}

export default HomeView;
