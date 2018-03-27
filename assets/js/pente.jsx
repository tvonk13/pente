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
		this.state = null;

		// Set channel listener for moves
		this.channel.on("new_state", payload => {
			console.log("Detected new state");
			this.setState(payload.game);
		})

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

	doMove() {
		console.log("Sending move to channel");
		this.channel.push("PLAYER_MOVE", {row: 0, col: 0})
			.receive("ok", this.getView.bind(this));
	}

	// Render the UI
	render() {
		if (this.state == null) {
			return (<div>NO STATE YET</div>);
		} else {
			return (
				<div>
				<p>TURN: {this.state.turn}</p>
				<p>0,0: {this.state.board[0][0]}</p>
				<button onClick={ () => this.doMove()}>DO MOVE</button>
				</div>
			);
		}
	}

}
