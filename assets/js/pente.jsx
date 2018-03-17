import React from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'reactstrap';

var w = 6;
var h = 6;
var emptyBoard = [];
for(var i=0; i<h; i++) {
  var row = [];
  for(var j=0; j<w; j++) {
    row.push({value: '', pos:{x: j, y: i}});
  }
  emptyBoard.push(row);
}

export default function game_init(root) {
  ReactDOM.render(<Pente board={emptyBoard}/>, root);
}

/* 
  App state for Pente is:
  {
    board: Array<Spaces> // a 12x12 2D array of spaces
    turn: String // the player whose turn it is
    isWon: boolean // whether the game has reached a win condition
  }

  A space has:
  {
    value: String // oneOf: 'R', 'B', ''
    pos: {
      x: int      // x coordinate
      y: int      // y coordinate
    }
  }

  Players or player pieces are denoted by 'R' (red) or 'B' (black)
*/

class Pente extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      board: props.board,
      turn: 'R', //TODO: make this randomized
      isWon: false,
    };
  }

  makeMove(params) {
    console.log('Current Player: ', this.state.turn);
    console.log('Tile clicked: ', params);
    
    let boardCopy = JSON.parse(JSON.stringify(this.state.board));
    let turnCopy = this.state.turn;
    const x = params.pos.x;
    const y = params.pos.y;

    boardCopy[y][x].value = turnCopy;
    var newTurn = (turnCopy == 'R') ? 'B' : 'R';

    this.setState({
      board: boardCopy,
      turn: newTurn,
      isWon: this.checkForWin.bind(this),
    });
  }

  checkForWin() {
    return this.state.isWon;
  }

  render() {
    return (
      <div className="container">
         <RenderBoard board={this.state.board} onClick={this.makeMove.bind(this)}/>
         <div className="status">
           <div className="turn">
             Current Player: {this.state.turn}
           </div>
           <div className="isWon">
             Game over: {this.state.isWon.toString()}
           </div>
         </div>
      </div>
    );
  }
}

function RenderButton(params) {
  var makeMove=params.onClick;
  return (
    <button className="button" onClick={() => makeMove(params)}>{params.value}</button>
  );
}

//TODO: make this a loop
function RenderBoard(params) {
  return(
    <div className="grid">
      <div className="row">
        {params.board[0].map((space, i) =>
          <RenderButton key={i} value={space.value} pos={space.pos} onClick={params.onClick} />
        )}
      </div>
      <div className="row">
        {params.board[1].map((space, i) =>
          <RenderButton key={i} value={space.value} pos={space.pos} onClick={params.onClick} />
        )}
      </div>
      <div className="row">
        {params.board[2].map((space, i) =>
          <RenderButton key={i} value={space.value} pos={space.pos} onClick={params.onClick} />
        )}
      </div>
      <div className="row">
        {params.board[3].map((space, i) =>
          <RenderButton key={i} value={space.value} pos={space.pos} onClick={params.onClick} />
        )}
      </div>
      <div className="row">
        {params.board[4].map((space, i) =>
          <RenderButton key={i} value={space.value} pos={space.pos} onClick={params.onClick} />
        )}
      </div>
      <div className="row">
        {params.board[5].map((space, i) =>
          <RenderButton key={i} value={space.value} pos={space.pos} onClick={params.onClick} />
        )}
      </div>
    </div>
  );
}

