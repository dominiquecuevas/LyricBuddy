function NavBar(props) {
    return (
        <nav id="nav" className="navbar sticky-top navbar-light bg-light justify-content-start">
        <div id="note"><a className="navbar-brand" href="/"><span id="logo">♫</span> <b>Note</b>
            <br />
            <span id="slogan">Lyrics Annotator</span>
            </a>
        </div> | 
        <a className="nav-link" onClick={props.handleAnnoSongs} href="/annosongs">Annotated Songs</a> |
        <a className="nav-link" onClick={props.handleUserAnnos} href="/user-annos">Account</a>
    </nav>
    )
}

function Search(props) {
    return (
        <form
        id="search"
        onSubmit={props.onSubmit}
        className="d-flex"
    >
        <input type="text" className="form-control mr-3" name="q" placeholder="Artist, Song, or Lyrics" />
        <input type="submit" className="btn btn-primary" value="Search" />
    </form>
    )
}

function StaffSuggestions(props) {
    return (
        <ul>
            <br />
            <b>Staff picks:</b>
            <li><a onClick={props.onClick} href="#">Adele - Send My Love (To Your New Lover)</a></li>
            <li><a onClick={props.onClick} href="#">Beyoncé - Run the World (Girls)</a></li>
            <li><a onClick={props.onClick} href="#">Halsey - Graveyard</a></li>
            <li><a onClick={props.onClick} href="#">Paramore - The Only Exception</a></li>
            <li><a onClick={props.onClick} href="#">Selena - Dreaming of You</a></li>
            <li><a onClick={props.onClick} href="#">SHAED - Trampoline</a></li>
            <li><a onClick={props.onClick} href="#">Sia - Chandelier</a></li>
            <li><a onClick={props.onClick} href="#">Tierra Whack - Hungry Hippo</a></li>
        </ul>
    )
}

function Lyrics(props) {
    return (
        <div id="lyrics" dangerouslySetInnerHTML={props.dangerouslySetInnerHTML}></div>
    )
}

class App extends React.Component {
    constructor() {
        super();
        this.state = {
            title: "",
            artist: "",
            lyrics: "",
            video: "",
            songDataLoaded: false,
            fragment: "",
            annotation: "",
            showLoadingGif: false,
            songAnnotations: false,
            annotations: "",
            songSuggestions: true,
            hits: "",
            searchHits: false,
            annoSongs: "",
            annoSongsLoaded: false,
            userAnnos: "",
            userAnnosLoaded: false,
            userName: "",
            userEmail: ""
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSelection = this.handleSelection.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleAnnoSongs = this.handleAnnoSongs.bind(this);
        this.handleUserAnnos = this.handleUserAnnos.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);

    }

    handleSubmit(evt) {
        evt.preventDefault();
        const q = $(evt.target).serialize();
        this.setState({
                        showLoadingGif: true
                     });

        $.get(`/api/search/hits?${q}`, (res) => {
            let songs = [];
            for (const song of res.songs) {
                console.log(song['song_artist']);
                songs.push(<li><a onClick={this.handleClick} href="#">{song['song_artist']} - {song['song_title']}</a></li>)
            };
            this.setState({
                            hits: songs,
                            showLoadingGif: false,
                            songSuggestions: false,
                            searchHits : true,
                            songDataLoaded: false,
                            annoSongsLoaded: false,
                            userAnnosLoaded: false,
                            video: ""
                            });
        });
    }

    handleAnnoSongs(evt) {
        evt.preventDefault();
        // this.setState({showLoadingGif: true});

        $.get('/annosongs.json', (res) => {
            let songs = [];
            for (const song of res) {
                songs.push(<li><a onClick={this.handleClick} href="#">{song['song_artist']} - {song['song_title']}</a></li>)
            };

            this.setState({
                            annoSongs: songs,
                            annoSongsLoaded: true,
                            // showLoadingGif: false,
                            songSuggestions: false,
                            searchHits : false,
                            songDataLoaded: false,
                            userAnnosLoaded: false,
                            video: ""
                            });
        });
    }

    handleUserAnnos(evt) {
        evt.preventDefault();
        // this.setState({showLoadingGif: true});

        $.get('/user-annos.json', (res) => {
            let annos = [];
            annos.push(<tr><th>Song</th><th>Lyrics Fragment</th><th>Annotation</th></tr>);
            for (const anno of res.anno_list) {
                annos.push(<tr><td><a onClick={this.handleClick} href="#">{anno.song_artist} - {anno.song_title}</a></td><td>{anno.song_fragment}</td><td>{anno.annotation}</td></tr>);
            };

            this.setState({
                            userName: res.user_name,
                            userEmail: res.user_email,
                            userAnnos: annos,
                            userAnnosLoaded: true,
                            // showLoadingGif: false,
                            songSuggestions: false,
                            searchHits : false,
                            songDataLoaded: false,
                            annoSongsLoaded: false,
                            video: ""
                            });

        });
    }

    handleClick(evt) {
        evt.preventDefault();
        const q = $(evt.target).html();
        this.setState({showLoadingGif: true});

        $.get(`/api/search?q=${q}`, (res) => {
            if (res.song_annos.length) {
                this.setState({ songAnnotations: true });
                let annotations = "<tr><th>Lyrics Fragment</th><th>Annotation</th><th>Annotation by</th></tr>";
                for (const song_anno of res.song_annos) {
                    annotations+=`<tr id="${song_anno['anno_id']}"></tr>`
                    annotations+=`<td>${song_anno['song_fragment']}</td>`
                    annotations+=`<td>${song_anno['annotation']}</td>`
                    annotations+=`<td>${song_anno['user.name']}</td>`
                    annotations+="</tr>"
                };
                this.setState({ annotations: annotations });
            } else {
                this.setState({ songAnnotations: false });
            };

            this.setState({
                title: res.song_title, 
                artist: res.song_artist,
                lyrics: res.lyrics,
                video: `https://www.youtube.com/embed/${res.video_url}?autoplay=0`,
                songDataLoaded: true,
                showLoadingGif: false,
                songSuggestions: false,
                searchHits: false ,
                annoSongsLoaded: false,
                userAnnosLoaded: false
            });
        });
    }

    handleSelection(evt) {
        evt.preventDefault();
        this.setState({
            fragment: $.selection()
        });

    }

    handleChange(evt) {
        this.setState({annotation: evt.target.value});
    }

    handleFormSubmit(evt) {
        evt.preventDefault();
        const data = {
            'annotation': this.state.annotation,
            'fragment': this.state.fragment,
            'song_title': this.state.title,
            'song_artist': this.state.artist,
            'lyrics': this.state.lyrics,
            'video_url': this.state.video
        }
        $.post('/save', data, (res) => {
            console.log('saved');

        }
        );
    }

    render() {
        let displayData = { display: 'none' };
        if (this.state.songDataLoaded) {
            displayData = null;
        };
        let displayAnnos = { display: 'none' };
        if (this.state.songAnnotations) {
            displayAnnos = null;
        } else {
            displayAnnos = { display: 'none' };
        };
        let displaySuggestions = null;
        if (!this.state.songSuggestions) {
            displaySuggestions = { display: 'none' };
        };
        let displayHits = {display: 'none'};
        if (this.state.searchHits) {
            displayHits = null;
        };
        let displayAnnoSongs = {display: 'none'};
        if (this.state.annoSongsLoaded) {
            displayAnnoSongs = null;
        };
        let displayUserAnnos = {display: 'none'};
        if (this.state.userAnnosLoaded) {
            displayUserAnnos = null;
        };

        return (
            <div>
                <NavBar handleAnnoSongs={this.handleAnnoSongs} handleUserAnnos={this.handleUserAnnos} />
                <br />
                <div className="container-fluid">
                    <div className="row">
                        <div className="col">
                            <Search onSubmit={this.handleSubmit}/>

                            <div
                                className="loading-gif"
                                style={(
                                    this.state.showLoadingGif ?
                                    {visibility: 'visible'} :
                                    {visibility: 'hidden'}
                                )}>
                                <div>
                                    <img id="catGif" src="/static/img/nyancat.gif" />
                                </div>
                                <span>Loading...</span>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-6">
                            <ul style={displayHits}>{this.state.hits}</ul>
                            <ul style={displayAnnoSongs}>{this.state.annoSongs}</ul>

                            <div style={displayUserAnnos}>
                                <b>Name:</b> {this.state.userName}<br /><br />
                                <b>Email:</b> {this.state.userEmail}<br /><br />
                                <b>Your Annotations:</b>
                                <table className="table table-striped table-bordered">
                                    {this.state.userAnnos}
                                </table>
                            </div>
                            <div style={displaySuggestions}>
                                <StaffSuggestions onClick={this.handleClick} />
                            </div>
                            
                        </div>
                    </div>

                    <div className="row" id="song-data" style={displayData}>

                        <div className="table container-t col-5">
                            <div className="table-row header">
                                <h2>{this.state.title}</h2>
                                <h3>{this.state.artist}</h3>
                                <p>
                                    <button onClick={this.handleSelection} id="get-fragment" className="btn btn-primary" data-toggle="modal" data-target="#modal">Highlight lyrics to annotate and click me!</button>
                                </p>
                            </div>

                            <div className="table-row body">
                                <div className="body-content-wrapper">
                                    <div className="body-content">
                                        <Lyrics dangerouslySetInnerHTML={{__html: this.state.lyrics}} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="col">

                            <iframe src={this.state.video} type="text/html" frameBorder="0" width="640" height="360"></iframe>
                            <form onSubmit={this.handleFormSubmit}>
                                <div className="form-group modal fade" id="modal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                                    <div className="modal-dialog" role="document">
                                        <div className="modal-content">
                                            <div className="modal-header">
                                                <h5 className="modal-title" id="exampleModalLabel">Input Annotation</h5>
                                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                                    <span aria-hidden="true">&times;</span>
                                                </button>
                                            </div>
                                            <div className="modal-body">
                                                <label for="fragment">Fragment</label>
                                                <div className="form-control" id="fragment">
                                                    {this.state.fragment}
                                                </div>
                                                <label for="annotation">Annotation</label>
                                                <textarea className="form-control" name="annotation" value={this.state.value} onChange={this.handleChange}></textarea><br />

                                                <input type="hidden" name="fragment" value={this.state.fragment} />
                                                <input type="hidden" name="song_title" value={this.state.title} />
                                                <input type="hidden" name="song_artist" value={this.state.artist} />
                                                <input type="hidden" name="lyrics" value={this.state.lyrics} />
                                                <input type="hidden" name="video_url" value={this.state.video} />
                                            </div>
                                            <div className="modal-footer">
                                                <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                                                <input type="submit" className="btn btn-primary" value="Save" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                            <table id="q_annotations" style={displayAnnos} className="table table-striped table-bordered" dangerouslySetInnerHTML={{__html: this.state.annotations}}>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        );
    }
}

ReactDOM.render(<App />, document.querySelector('#root'));

