import React, { Component } from 'react';

import { loadAllPlaces } from './../../services/place';

import PlaceMini from './../../components/Place/PlaceMini';

export class PlacesList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      places: undefined
    };
  }

  componentDidMount() {
    loadAllPlaces().then(data => {
      const { places } = data;
      this.setState({
        loaded: true,
        places
      });
    });
    /*loadSupport(id).then(data => {
      const { support } = data;
      this.setState({
        loaded: true,
        support
      });
    });*/
  }

  render() {
    return (
      <div className="places">
        {this.state.loaded && (
          <div className="places-list">
            {this.state.places.map(place => (
              <div className="place">
                <PlaceMini selected={place} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}

export default PlacesList;