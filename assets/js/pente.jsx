import React from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'reactstrap';

export default function run_pente(root, channel) {
	ReactDOM.render(<Pente channel={channel} />, root);
}

class Pente extends React.Component {

	// Set an initial empty state and connect to the channel to get the first view
	constructor(props) {
		super(props);
		this.channel = props.channel;

		// TODO: Set initial local state?

		this.channel.join()
			.receive("ok", this.getView.bind(this))
			.receive("error", resp => { console.log("Unable to join", resp);
		   					window.location.href = "/"});
	}

	// Update the current state based on the response from the server
	getView(view) {
		console.log("New view");
		this.setState(view.game);
	}

	// Render the UI
	render() {
		return (<div>test</div>);
	}

}
