import React, { Component } from 'react';
import SpotifyWebApi from 'spotify-web-api-js';

import Playback from './Playback';
import './ProgressBar.css';
import './App.css';

const spotifyApi = new SpotifyWebApi();

class App extends Component {

  constructor() {
    super();
    const params = this.getHashParams();
    const token = params.access_token;
    const refresh_token = params.refresh_token;
    if(token) {
      spotifyApi.setAccessToken(token);
    }

    this.state = {
      loggedIn: token ? true : false,
      nowPlaying: {name: 'Not Checked', albumArt: ''},
      token: token,
      refresh_token: refresh_token,
      progress: 0,
      expiration_time: 0
    }
    
    this.nowPlayingInterval = setInterval(() => this.getNowPlaying(), 4000);
    this.getNewAccessToken = this.getNewAccessToken.bind(this);
    this.expirationTimer = setInterval(() => this.ExpirationTimer(), 9000);
 
  }

  componentDidMount(){
    fetch('http://192.168.3.190:8888/refresh_token?refresh_token=' +  this.state.refresh_token)
    .then(results => {
      return results.json();
    }).then(data => {
      var newToken = data.access_token;
      var expiration_time = data.expiration_time;
      console.log(newToken);
      this.setState({
        token: newToken,
        expiration_time: expiration_time
      })
      spotifyApi.setAccessToken(newToken);
    })    
  }

  getNowPlaying() {
    if (this.state.loggedIn === true){
      spotifyApi.getMyCurrentPlaybackState()
    .then((response) => {
      //console.log(response);
      this.setState({
        nowPlaying: {
        name: response.item.name,
        albumArt: response.item.album.images[0].url,
        },
        progress: response.progress_ms
      })
    })}
  }

  ExpirationTimer() {
    var expiration_time = this.state.expiration_time;
    if (expiration_time <= 60)
    {
      this.getNewAccessToken();
    }else {
      expiration_time = expiration_time - 9;
      this.setState({ expiration_time: expiration_time })
    }
  }

  getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
    q = window.location.hash.substring(1);
    e = r.exec(q);
    while(e) {
      hashParams[e[1]] = decodeURIComponent(e[2]);
      e = r.exec(q);
    }
    return hashParams;
  }

  getNewAccessToken(e) {
    if (e !== undefined)
    {
      e.preventDefault();

    }
  fetch('http://192.168.3.190:8888/refresh_token?refresh_token=' +  this.state.refresh_token)
  .then(results => {
    return results.json();
  }).then(data => {
    var newToken = data.access_token;
    var expiration_time = data.expiration_time;
    console.log(newToken);
    this.setState({
      token: newToken,
      expiration_time: expiration_time
    })
    spotifyApi.setAccessToken(newToken);
  })
  
  }

  render() {
    return (
      <div className="App">
        {this.state.loggedIn === false && <a href='http://192.168.3.190:8888'>Login to Spotify</a>}
        <button onClick={(e) => this.getNewAccessToken(e)}>Get New Access Token </button>
        <div>
          Now Playing: {this.state.nowPlaying.name}
        </div>
        <div>
          <img src={this.state.nowPlaying.albumArt} style={{ height: 300 }} alt="album art"/>
        </div>
        {this.state.token &&
        <Playback accessToken={this.state.token} progress={this.state.progress} />
        }
      </div>
    );
  }
}

export default App;

//debugging button for access token <button onClick={(e) => this.getNewAccessToken(e)}>Get New Access Token </button>