import React from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'reactstrap';

export default function run_pente(root, channel) {
	ReactDOM.render(<Pente channel={channel} />, root);
}

var w = 7

class Pente extends React.Component {

	// Set an initial empty state and connect to the channel to get the first view
	constructor(props) {
		super(props);
		this.channel = props.channel;

		// Set initial local state
		var emptyBoard = [];
		for (var i = 0; i < w; i++) {
			var row = [];
			for (var j = 0; j < w; j++) {
				row.push('');
			}
		    emptyBoard.push(row);
		}

		this.state = {
			board: emptyBoard,
			turn: 'R',
			pairs: {R: 0, B: 0}
		}

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

    //alert box for rules of the game
    viewRules() {
        alert('Each player takes turn placing pieces on the board. To place a piece on the board, click on an intersection of the grid. If you place pieces on either side of two of the other players\' pieces (i.e. [R, B, B, R]), you take those pieces from the board and keep them. However, if you place two pieces between your opponents\' pieces, they do not take your pieces. To win, you must be the first player to place 5 pieces in a row either horizontally, vertically, or diagonally or collect 5 pairs of the other players\' pieces.');
    }

	// Process user move. Send message to channel
	makeMove(row, col) {
		console.log("Sending move to channel");
		this.channel.push("player_move", {row: row, col: col})
			.receive("ok", this.getView.bind(this));
	}

	// Restart the game with a fresh game state
	reset() {
		console.log("Restarting the game");
		this.channel.push("restart")
			.receive("ok", this.getView.bind(this));
	}

	// Actually render the game UI
    render() {
        var turnColor = (this.state.turn == 'R') ? 'red' : 'black';
        return (
            <div className="row container">
                <div className="welcome" >
                    Welcome to Pente! To place a piece on the board, click on an intersection of the grid. To view the rules of the game, click the "rules" button. To start a new game, click the "restart" button. The pairs taken by each player are shown in the red and black bars (i.e. the pairs taken by red are shown in the red bar).
                    </div>
                <div className="col">
                    <div className="board-wrapper">
                        <div className="grid-lines">
                            <RenderGrid board={this.state.board} />
                        </div>
                        <div className="board">
                            <RenderBoardLoop board={this.state.board} onClick={this.makeMove.bind(this)} />
                        </div>
                    </div>
                </div>
                <div className="col">
                    <div className="info">
                        <div className="turn" style={{ color: turnColor }}>
                            {(this.state.turn == 'R') ? 'Red' : 'Black'}'s turn
                            </div>
                        <div className="pairs">
                            <div className="pair-table-title" >
                                Pairs taken:
                                </div>
                            <RenderPairTable redPairs={this.state.pairs.R} blackPairs={this.state.pairs.B} />
                        </div>
                        <div className="buttons">
                            <button type="button" className="restart btn btn-warning" onClick={this.reset.bind(this)}>Restart</button>
                            <button type="button" className="rules btn btn-info" onClick={this.viewRules.bind(this)}>Rules</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

function RenderButton(params) {
    var makeMove = params.onClick;
    let bgColor = 'white';
    let bgOpacity = 0;
	var r = params.row;
	var c = params.col;
    if (params.value != '') {
        bgColor = (params.value == 'R') ? 'red' : 'black';
        bgOpacity = 1;
    }
    var buttonStyle = {
        backgroundColor: bgColor,
        opacity: bgOpacity
    };
    return (
        <button className="piece" style={buttonStyle} onClick={() => makeMove(r, c)}>{r},{c}</button>
    );
}

function RenderBoardLoop(params) {
    return (
        <div className="grid">
            {params.board.map((row, i) =>
                <div className="row" key={i}>
                    {row.map((space, j) =>
                        <RenderButton key={j} value={space} row={i} col={j} onClick={params.onClick} />
                    )}
                </div>
            )}
        </div>
    );
}

function RenderGrid(params) {
    var arr = [];
    for (var i = 0; i < w + 1; i++) {
        var row = [];
        for (var j = 0; j < w + 1; j++) {
            row.push('');
        }
        arr.push(row);
    }
    return (
        <div className="grid">
            {arr.map((row, i) =>
                <div className="row" key={i}>
                    {row.map((space, j) =>
                        <div key={j} className="square"></div>
                    )}
                </div>
            )}
        </div>
    );
}

function RenderPair(params) {
    var pairStyle = {
        backgroundColor: params.color,
        opacity: params.pair,
    }
    return (
        <div className="pair">
            <div className="circle" style={pairStyle} ></div>
            <div className="circle" style={pairStyle} ></div>
        </div>
    );
}

function RenderPairTable(params) {
    var redArr = [];
    var blackArr = [];
    var redCount = params.redPairs;
    var blackCount = params.blackPairs;
    for (var i = 0; i < 5; i++) {
        if (redCount > 0) {
            redArr.push(1);
            redCount--;
        } else {
            redArr.push(0);
        }
        if (blackCount > 0) {
            blackArr.push(1);
            blackCount--;
        } else {
            blackArr.push(0);
        }
    }
    return (
        <div className="grid pairTable">
            <div className="row pairRow" style={{ backgroundColor: 'red' }}>
                {redArr.map((pair, i) =>
                    <RenderPair key={i} pair={pair} color='black' />
                )}
            </div>
            <div className="row pairRow" style={{ backgroundColor: 'black' }}>
                {blackArr.map((pair, i) =>
                    <RenderPair key={i} pair={pair} color='red' />
                )}
            </div>
        </div>
    );
}
