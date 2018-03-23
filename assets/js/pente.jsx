import React from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'reactstrap';

var w = 6;
var winLength = 5;
var players = ['R', 'B'];
var emptyBoard = [];
for(var i=0; i<w; i++) {
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
      turn: players[Math.floor(Math.random() * players.length)],
    };
  }

  makeMove(params) {
    console.log('Current Player: ', this.state.turn);
    console.log('Tile clicked: ', params);
    const won = this.checkForWin(this.state);
    let boardCopy = JSON.parse(JSON.stringify(this.state.board));
    let newTurn = this.state.turn;
    const turnCopy = this.state.turn;
    const x = params.pos.x;
    const y = params.pos.y;

    if(!won) {
      if(params.value !== 'R' && params.value !== 'B') {
        boardCopy[y][x].value = turnCopy;
        newTurn = (turnCopy == 'R') ? 'B' : 'R';
      }

      this.setState({
        board: boardCopy,
        turn: newTurn,
      });
    } else {
      alert('Game won! Winner: ' + turnCopy);
      this.setState({
        board: emptyBoard,
        turn: players[Math.floor(Math.random() * players.length)], 
      });
    }
  }

  checkForWin(state) {
    //console.log('Checking for win');
    const board = state.board;
    let isWon = false;

    for(var row=0; row<board.length; row++) {
      for(var col=0; col<board.length; col++) {
        //console.log('check win for: ', board[row][col]);
        isWon = this.checkVertHoriz(board, row, col, 'h') || this.checkVertHoriz(board, row, col, 'v') || this.checkDiagonal(board, row, col);
        if(isWon){
          return true;
        }
      }
    }
    return false;
  }

  checkVertHoriz(board, row, col, dir) {
    const space = board[row][col];
    const curVal = space.value;
    const index = (dir == 'h') ? col : row;
    let nextVal = space.value;
    let count = 0;

    if(curVal != '') {
      for(var i=Math.max(index-winLength-1, 0); i<=index; i++) {
        count = 0;
        for(var j=i; j<Math.min(i+winLength, w); j++) {
          if(j < w) {
            nextVal = (dir == 'h') ? board[row][j].value : board[j][col].value;
            if(nextVal == curVal) {
              count++;
            } else {
              count=0;
              break;
            }
          }
        }
        if(count == winLength) {
          return true;
        }
      }
    }
    return false;
  }

  checkDiagonal(board, row, col) {
    const space = board[row][col];
    const curVal = space.value;
    let nextVal = space.value;
    let count = 0;

    if(curVal != '') {
      const diff = Math.min(row, col) - Math.min(Math.max(col-(winLength-1), 0), Math.max(row-(winLength-1), 0));
      for(var i=diff; i >=0; i--) {
        count = 0;
        for(var j=0; j<5; j++) {
          if(row-i+j < w && col-i+j < w) {
            nextVal = board[row-i+j][col-i+j].value;
            if(nextVal == curVal) {
              count++;
            } else {
              count=0;
              break;
            }
          }
        }
        if(count == winLength) {
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
