import React, { Component } from 'react';

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
        }
        this.playerCheckInterval = null;
        this.SpotifyPlayback = this.SpotifyPlayback.bind(this);
        this.onStateChanged = this.onStateChanged.bind(this);
    }

    createEventHandlers() {
        /* ... */
        this.player.on('player_state_changed', state => this.onStateChanged(state));
        /* ... */
      }
      

    componentDidMount(){
        this.setState({ accessToken: this.props.accessToken});
        this.playerCheckInterval = setInterval(() => this.SpotifyPlayback(), 1000);
    }

    componentWillReceiveProps(nextProps){
        if (this.props.accessToken !== nextProps.accessToken)
        {
            this.setState({ accessToken: nextProps.accessToken});
        }
        if (this.props.progress !== nextProps.progress){
            this.setState({ progress: nextProps.progress });
        }

    }

    SpotifyPlayback() {

        if (window.Spotify !== undefined && this.state.accessToken !== null) {
            const token = this.state.accessToken;
            this.player = new window.Spotify.Player({
              name: 'Web Playback SDK Quick Start Player',
              getOAuthToken: cb => { cb(token); }
            });
      
            // Error handling
            this.player.addListener('initialization_error', ({ message }) => { console.error(message); });
            this.player.addListener('authentication_error', ({ message }) => { console.error(message); });
            this.player.addListener('account_error', ({ message }) => { console.error(message); });
            this.player.addListener('playback_error', ({ message }) => { console.error(message); });
      
            // Playback status updates
            this.player.addListener('player_state_changed', state => { console.log(state); });

      
            // Ready
            this.player.addListener('ready', ({ device_id }) => {
              console.log('Ready with Device ID', device_id);
            });
      
            // Not Ready
            this.player.addListener('not_ready', ({ device_id }) => {
              console.log('Device ID has gone offline', device_id);
            });
      
            // Connect to the player!
            this.player.connect();

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
            playing
          });

         
        }
      }
      

    render() {
        const {
            artistName,
            trackName,
            albumName,
            position,
            duration,
            playing,
          } = this.state;
        return(
        <div>
            <p>Artist: {artistName}</p>
            <p>Track: {trackName}</p>
            <p>Album: {albumName}</p>
            <progress id="progress-bar" value={(this.state.progress / this.state.duration) * 100} max="100"></progress>
      </div>
        )
    }
}

export default Playback;