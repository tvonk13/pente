import React from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'reactstrap';

const w = 10;
const winLength = 5;
const wL = winLength - 1;
const players = ['R', 'B'];
var emptyBoard = [];
for(var i=0; i<w; i++) {
  var row = [];
  for(var j=0; j<w; j++) {
    row.push({value: '', pos:{row: i, col: j}});
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
      row: int      // row index
      col: int      // column index
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

  //TODO: fix bug where win is not checked until next click
  makeMove(params) {
    console.log('Current Player: ', this.state.turn);
    console.log('Tile clicked: ', params);
    const won = this.checkForWin(this.state);
    let boardCopy = JSON.parse(JSON.stringify(this.state.board));
    let newTurn = this.state.turn;
    const turnCopy = this.state.turn;
    const row = params.pos.row;
    const col = params.pos.col;

    if(!won) {
      if(params.value !== 'R' && params.value !== 'B') {
        boardCopy[row][col].value = turnCopy;
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
    const board = state.board;
    let isWon = false;

    for(var row=0; row<board.length; row++) {
      for(var col=0; col<board.length; col++) {
        isWon = this.isWonWrapper(board, row, col);
        if(isWon){
          return true;
        }
      }
    }
    return false;
  }

  isWonWrapper(board, row, col) {
    return this.checkVertHoriz(board, row, col, 'h') || this.checkVertHoriz(board, row, col, 'v') || this.checkDiagonal(board, row, col, 'l') || this.checkDiagonal(board, row, col, 'r');
  }

  checkVertHoriz(board, row, col, dir) {
    const space = board[row][col];
    const curVal = space.value;
    const index = (dir == 'h') ? col : row;
    let nextVal = space.value;
    let count = 0;

    if(curVal != '') {
      for(var i=Math.max(index-wL, 0); i<=index; i++) {
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

  checkDiagonal(board, row, col, dir) {
    const space = board[row][col];
    const curVal = space.value;
    let nextVal = space.value;
    let count = 0;
    const loopDir = (dir == 'r') ? (-1) : 1;
    
    if(curVal != '') {
      const colMax = Math.min(col+wL, w-1);
      const colMin = Math.max(col-wL, 0);
      const rowMax = Math.min(row+wL, w-1);
      const rowMin = Math.max(row-wL, 0);
      var cInit = (dir == 'r') ? colMax : colMin; 

      for(var r=rowMin, c=cInit; r<=rowMax; c+=loopDir, r++) {
        nextVal = board[r][c].value;
        if(nextVal == curVal) {
          count ++;
          if(count == winLength) {
            return true;
          }
        } else {
          count = 0;
          break;
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
