import React, { Component } from 'react';

import Previous from './assets/svg/previous.svg';
import Skip from './assets/svg/skip.svg';
import Play from './assets/svg/play.svg';
import Pause from './assets/svg/pause.svg';
import VolumeUp from './assets/svg/volume_up.svg';
import VolumeDown from './assets/svg/volume_down.svg';
class Playback extends Component {
    constructor() {
        super();
        this.state = {
            status: null,
            accessToken: null,
            token: "",
            deviceId: "",
            loggedIn: false,
            error: "",
            trackName: "Track Name",
            artistName: "Artist Name",
            albumName: "Album Name",
            playing: false,
            progress: 0,
            duration: 0,
            volume: 0,
            progressBar: 0
        }
        this.playerCheckInterval = null;
        this.SpotifyPlayback = this.SpotifyPlayback.bind(this);
        this.onStateChanged = this.onStateChanged.bind(this);
        this.onVolumeChange = this.onVolumeChange.bind(this);
        this.onProgressBarSeek = this.onProgressBarSeek.bind(this);
    }

    createEventHandlers() {
        this.player.on('player_state_changed', state => this.onStateChanged(state));
      }
      

    componentDidMount(){
        this.setState({ accessToken: this.props.accessToken});
        this.playerCheckInterval = setInterval(() => this.SpotifyPlayback(), 1000);
    }

    componentWillReceiveProps(nextProps){
        if (this.props.accessToken !== nextProps.accessToken)
        {
            this.setState({ accessToken: nextProps.accessToken});
            //Updates token for playback API
            if (this.player !== undefined)
            this.player.getOAuthToken = this.state.accessToken;
        }
        if (this.props.progress !== nextProps.progress){
            this.setState({ progress: nextProps.progress,
              progressBar: Math.round(this.state.progress / this.state.duration * 100)
             });
        }

    }

    SpotifyPlayback() {

        if (window.Spotify !== undefined && this.state.accessToken !== null) {
            const token = this.state.accessToken;
            this.player = new window.Spotify.Player({
              name: "Austen's Spotify App",
              getOAuthToken: cb => { cb(token); }
            });
      
            // Error handling
            this.player.addListener('initialization_error', ({ message }) => { console.error(message); });
            this.player.addListener('authentication_error', ({ message }) => { console.error(message); });
            this.player.addListener('account_error', ({ message }) => { console.error(message); });
            this.player.addListener('playback_error', ({ message }) => { console.error(message); });
      
            // Playback status updates
            //this.player.addListener('player_state_changed', state => { console.log(state); });

      
            // Ready
            // this.player.addListener('ready', ({ device_id }) => {
            //   console.log('Ready with Device ID', device_id);
            // });
      
            // Not Ready
            this.player.addListener('not_ready', ({ device_id }) => {
              console.log('Device ID has gone offline', device_id);
            });
      
            // Connect to the player!
            this.player.connect();
            this.getVolume();
            this.createEventHandlers();
            clearInterval(this.playerCheckInterval);
          };
    }

    onStateChanged(state) {
        // if we're no longer listening to music, we'll get a null state.
        if (state !== null) {
          const {
            current_track: currentTrack,
          } = state.track_window;
          const trackName = currentTrack.name;
          const duration = currentTrack.duration_ms;
          const albumName = currentTrack.album.name;
          const artistName = currentTrack.artists
            .map(artist => artist.name)
            .join(", ");
          const playing = !state.paused;
          this.setState({
            duration,
            trackName,
            albumName,
            artistName,
            playing,
          });   
        }
      }

      onPrevClick() {
        this.player.previousTrack();
      }

      onPlayClick() {
        this.player.togglePlay();
      }

      onNextClick() {
        this.player.nextTrack();
      }

      onVolumeChange(event) {
        this.setState({ volume: event.target.value })
        this.player.setVolume(this.state.volume / 100);
      }

      getVolume() {
        this.player.getVolume().then(volume => {
          this.setState({volume: volume * 100}) 
          console.log(`The volume of the player is ${this.state.volume}%`);
        });
      }

      VolumeBar() {
        return(
          <input type="range" value={this.state.volume} onChange={(event) => this.onVolumeChange(event)} id="volume" max="100"/>
        )
      }

      onProgressBarSeek(event) {
        this.setState({ progressBar: event.target.value })
        this.player.seek((this.state.duration * (event.target.value / 100)));
      }

      ProgressBar() {
        return(
          <input type="range" id="progress-bar" value={this.state.progressBar} onChange={(event) => this.onProgressBarSeek(event)} max="100"/>
        )
      }
      
    render() {
        const {
            artistName,
            trackName,
            albumName,
            playing,
          } = this.state;
        return(
        <div>
            <p>Artist: {artistName}</p>
            <p>Track: {trackName}</p>
            <p>Album: {albumName}</p>
            <div className="progress-bar">
              {this.ProgressBar()}
            </div>
            <div className="playback-controls">
                <input type="image" src={Previous} onClick={() => this.onPrevClick()} alt="Previous Song"/>
                <input type="image" src={playing ? Pause : Play} onClick={() => this.onPlayClick()} alt="Play/Pause"/>
                <input type="image" src={Skip} onClick={() => this.onNextClick()} alt="Skip Song"/>
            </div>
            <div className="volume-bar">
            <img src={VolumeDown} alt="Volume Down"/>
            {this.VolumeBar()}
            <img src={VolumeUp} alt="Volume Up"/>
            </div>
      </div>
        )
    }
}

export default Playback;