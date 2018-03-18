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
    };
  }

  makeMove(params) {
    console.log('Current Player: ', this.state.turn);
    console.log('Tile clicked: ', params);
    
    let boardCopy = JSON.parse(JSON.stringify(this.state.board));
    let newTurn = this.state.turn;
    const turnCopy = this.state.turn;
    const x = params.pos.x;
    const y = params.pos.y;

    if(params.value !== 'R' && params.value !== 'B') {
      boardCopy[y][x].value = turnCopy;
      newTurn = (turnCopy == 'R') ? 'B' : 'R';
    }

    this.setState({
      board: boardCopy,
      turn: newTurn,
    });
    const won = this.checkForWin();
    if(won) alert('Game won!');
  }

  checkForWin() {
    console.log('Checking for win');
    const board = this.state.board;
    let isWon = false;

    for(var row=0; row<board.length; row++) {
      for(var col=0; col<board[row].length; col++) {
        console.log('checkHorizontal for: ', board[row][col]);
        isWon = this.checkHorizontal(board, row, col);
        if(isWon){
          return true;
        }
      }
    }
    return false;
  }

  checkHorizontal(board, row, col) {
    console.log('Checking horizontal');
    const space = board[row][col];
    let nextVal = space.value;
    const curVal = space.value;
    let count = 0;

    if(curVal != '') {
    console.log('space is not empty');
      for(var i=Math.max(col-4, 0); i<=col; i++) {
        console.log('i: ', i);
        for(var j=i; j<i+5; j++) {
          console.log('j: ', j);
          nextVal = board[row][j].value;
          console.log('nextVal: ', nextVal);
          if(nextVal == curVal) {
            count++;
          } else {
            count=0;
            break;
          }
        }
        if(count == 5) {
          return true;
        }
      }
    }
    return false;
  }

  render() {
    return (
      <div className="container">
         <RenderBoardLoop board={this.state.board} onClick={this.makeMove.bind(this)}/>
         <div className="status">
           <div className="turn">
             Current Player: {this.state.turn}
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

function RenderBoardLoop(params) {
 return (
   <div className="grid">
     {params.board.map((row, i) =>
       <div className="row" key={i}>
         {row.map((space, j) =>
           <RenderButton key={j} value={space.value} pos={space.pos} onClick={params.onClick} />
         )}
       </div>
     )}
   </div>
 );
}
