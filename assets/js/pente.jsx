import React from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'reactstrap';

const w = 10; //width of the board (size is w x w square)
const winLength = 5; //number of pieces in a row required for win
const wL = winLength - 1; //for calculations in checking win condition functions
const players = ['R', 'B']; //set of players
var emptyBoard = [];

//create an empty board
for (var i = 0; i < w; i++) {
    var row = [];
    for (var j = 0; j < w; j++) {
        row.push({ value: '', pos: { row: i, col: j } });//, color: 'white', opacity: 1});
    }
    emptyBoard.push(row);
}

export default function game_init(root) {
    ReactDOM.render(<Pente board={emptyBoard} />, root);
}

/* 
  App state for Pente is:
  {
    board: Array<Spaces> // a w x w 2D array of spaces
    turn: String // the player whose turn it is - oneOf: 'R', 'B'
    pairs: Object // the number of pairs collected by R and B
  }

  A space has:
  {
    value: String // oneOf: 'R', 'B', ''
    pos: {
      row: int      // row index
      col: int      // column index
    } 
    opacity: int // whether or not the button is shown - oneOf: 0, 1
  }

  A pair has:
  {
    R: int // the number of pairs collected by 'R'
    B: int // the number of pairs collected by 'B'
  }

  Players or player pieces are denoted by 'R' (red) or 'B' (black)
*/

class Pente extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            board: props.board,
            turn: players[Math.floor(Math.random() * players.length)], //randomly choose 'R' or 'B' to start
            pairs: { R: 0, B: 0 },
        };
    }

    //reset board back to empty state
    reset() {
        this.setState({
            board: emptyBoard,
            turn: players[Math.floor(Math.random() * players.length)],
            pairs: { R: 0, B: 0 },
        });
    }

    //alert box for rules of the game
    viewRules() {
        alert('Each player takes turn placing pieces on the board. To place a piece on the board, click on an intersection of the grid. If you place pieces on either side of two of the other players\' pieces (i.e. [R, B, B, R]), you take those pieces from the board and keep them. However, if you place two pieces between your opponents\' pieces, they do not take your pieces. To win, you must be the first player to place 5 pieces in a row either horizontally, vertically, or diagonally or collect 5 pairs of the other players\' pieces.');
    }

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
    if (params.value != '') {
        bgColor = (params.value == 'R') ? 'red' : 'black';
        bgOpacity = 1;
    }
    var buttonStyle = {
        backgroundColor: bgColor,
        opacity: bgOpacity
    };
    return (
        <button className="piece" style={buttonStyle} onClick={() => makeMove(params)}></button>
    );
}

function RenderBoardLoop(params) {
    return (
        <div className="grid">
            {params.board.map((row, i) =>
                <div className="row" key={i}>
                    {row.map((space, j) =>
                        <RenderButton key={j} value={space.value} pos={space.pos} onClick={params.onClick}/>
                    )}
                </div>
            )}
        </div>
    );
}

function RenderGrid(params) {
    var arr = [];
    for (var i = 0; i < w+1; i++) {
        var row = [];
        for (var j = 0; j < w+1; j++) {
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
