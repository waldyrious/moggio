/** @jsx React.DOM */

var TrackListRow = React.createClass({displayName: 'TrackListRow',
	render: function() {
		return (React.DOM.tr(null, React.DOM.td(null, this.props.protocol), React.DOM.td(null, this.props.id)));
	}
});

var Track = React.createClass({displayName: 'Track',
	render: function() {
		return (
			React.DOM.tr(null, 
				React.DOM.td(null, this.props.protocol), 
				React.DOM.td(null, this.props.id)
			)
		);
	}
});

var TrackList = React.createClass({displayName: 'TrackList',
	getInitialState: function() {
		return {
			tracks: []
		};
	},
	componentDidMount: function() {
		$.get('/api/list', function(result) {
			this.setState({tracks: result});
		}.bind(this));
	},
	render: function() {
		var tracks = this.state.tracks.map(function (t) {
			return Track({protocol: t[0], id: t[1], key: t[0] + '|' + t[1]});
		});
		return (
			React.DOM.table(null, 
				React.DOM.tbody(null, tracks)
			)
		);
	}
});

var ProtocolParam = React.createClass({displayName: 'ProtocolParam',
	getInitialState: function() {
		return {
			value: '',
			changed: false,
		};
	},
	componentWillReceiveProps: function(props) {
		if (this.state.changed) {
			return;
		}
		this.setState({
			value: props.value,
			changed: true,
		});
	},
	paramChange: function(event) {
		this.setState({
			value: event.target.value,
		});
		this.props.change();

	},
	render: function() {
		return (
			React.DOM.li(null, 
				this.props.key, " ", React.DOM.input({type: "text", onChange: this.paramChange, value: this.state.value})
			)
		);
	}
});

var Protocol = React.createClass({displayName: 'Protocol',
	getInitialState: function() {
		return {
			save: false,
		};
	},
	setSave: function() {
		this.setState({save: true});
	},
	save: function() {
		var params = Object.keys(this.refs).sort();
		params = params.map(function(ref) {
			return {
				name: 'params',
				value: this.refs[ref].state.value,
			};
		}, this);
		params.push({
			name: 'protocol',
			value: this.props.key,
		});
		$.post('/api/protocol/update?' + $.param(params))
			.success(function() {
				this.setState({save: false});
			}.bind(this))
			.error(function(result) {
				alert(result.responseText);
			});
	},
	render: function() {
		var params = this.props.params.map(function(param, idx) {
			var current = this.props.current || [];
			return ProtocolParam({key: param, ref: idx, value: current[idx], change: this.setSave});
		}.bind(this));
		var save;
		if (this.state.save) {
			save = React.DOM.button({onClick: this.save}, "save");
		}
		return (
			React.DOM.div({key: this.props.key}, 
				React.DOM.h2(null, this.props.key), 
				React.DOM.ul(null, params), 
				save
			)
		);
	}
});

var Protocols = React.createClass({displayName: 'Protocols',
	getInitialState: function() {
		return {
			available: {},
			current: {},
		};
	},
	componentDidMount: function() {
		$.get('/api/protocol/get', function(result) {
			this.setState({available: result});
		}.bind(this));
		$.get('/api/protocol/list', function(result) {
			this.setState({current: result});
		}.bind(this));
	},
	render: function() {
		var keys = Object.keys(this.state.available);
		keys.sort();
		var protocols = keys.map(function(protocol) {
			return Protocol({key: protocol, params: this.state.available[protocol], current: this.state.current[protocol]});
		}.bind(this));
		return React.DOM.div(null, protocols);
	}
});

var routes = {};

var Link = React.createClass({displayName: 'Link',
	componentDidMount: function() {
		routes[this.props.href] = this.props.handler;
		if (this.props.index) {
			routes['/'] = this.props.handler;
		}
	},
	click: function(event) {
		history.pushState(null, this.props.Name, this.props.href);
		router();
		event.preventDefault();
	},
	render: function() {
		return React.DOM.li(null, React.DOM.a({href: this.props.href, onClick: this.click}, this.props.name))
	}
});

var Navigation = React.createClass({displayName: 'Navigation',
	render: function() {
		return (
			React.DOM.ul(null, 
				Link({href: "/list", name: "List", handler: TrackList, index: true}), 
				Link({href: "/protocols", name: "Protocols", handler: Protocols})
			)
		);
	}
});

React.renderComponent(Navigation(null), document.getElementById('navigation'));

function router() {
	var component = routes[window.location.pathname];
	if (!component) {
		alert('unknown route');
	} else {
		React.renderComponent(component(), document.getElementById('main'));
	}
}
router();