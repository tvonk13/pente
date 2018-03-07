import React from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'reactstrap';

var w = 6;
var h = 6;
var emptyBoard = [];
for(var i=0; i<h; i++) {
  var row = [];
  for(var j=0; j<w; j++) {
    row.push('');
  }
  emptyBoard.push(row);
}

export default function game_init(root) {
  ReactDOM.render(<Pente board={emptyBoard}/>, root);
}

/* 
  App state for Pente is:
  {
    board: Array // a 12x12 2D array representing the state of the board
    turn: String // the player whose turn it is
    won: boolean // whether the game has reached a win condition
  }

  Players or player pieces are denoted by 'R' (red) or 'B' (black)
*/

class Pente extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      board: props.board,
      turn: 'R', //TODO: make this randomized
      won: false,
    };
  }

  render() {
    return (
      <div className="container">
         <RenderBoard board={this.state.board} />
      </div>
    );
  }
}

function RenderButton(params) {
  return (
    <button className="button">{params.value}</button>
  );
}

//TODO: make this a loop
function RenderBoard(params) {
  return(
    <div className="grid">
      <div className="row">
        <RenderButton value="" />
        <RenderButton value="" />
        <RenderButton value="" />
        <RenderButton value="" />
        <RenderButton value="" />
        <RenderButton value="" />
      </div>
      <div className="row">
        <RenderButton value="" />
        <RenderButton value="" />
        <RenderButton value="" />
        <RenderButton value="" />
        <RenderButton value="" />
        <RenderButton value="" />
      </div>
      <div className="row">
        <RenderButton value="" />
        <RenderButton value="" />
        <RenderButton value="" />
        <RenderButton value="" />
        <RenderButton value="" />
        <RenderButton value="" />
      </div>
      <div className="row">
        <RenderButton value="" />
        <RenderButton value="" />
        <RenderButton value="" />
        <RenderButton value="" />
        <RenderButton value="" />
        <RenderButton value="" />
      </div>
      <div className="row">
        <RenderButton value="" />
        <RenderButton value="" />
        <RenderButton value="" />
        <RenderButton value="" />
        <RenderButton value="" />
        <RenderButton value="" />
      </div>
      <div className="row">
        <RenderButton value="" />
        <RenderButton value="" />
        <RenderButton value="" />
        <RenderButton value="" />
        <RenderButton value="" />
        <RenderButton value="" />
      </div>
    </div>
  );
}
