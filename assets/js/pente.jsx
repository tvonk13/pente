import React from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'reactstrap';

const w = 7;
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
    pairs: Object // the number of pairs collected by R and B
  }

  A space has:
  {
    value: String // oneOf: 'R', 'B', ''
    pos: {
      row: int      // row index
      col: int      // column index
    }
  }

  pairs:
  {
    R: int // the number of pairs collected by r
    B: int // the number of pairs collected by b
  }

  Players or player pieces are denoted by 'R' (red) or 'B' (black)
*/

class Pente extends React.Component {  
  constructor(props) {
    super(props);
    this.state = {
      board: props.board,
      turn: players[Math.floor(Math.random() * players.length)],
      pairs: {R: 0, B: 0},
    };
  }

  makeMove(params) {
    console.log('Current Player: ', this.state.turn);
    console.log('Tile clicked: ', params);
    console.log('Current state: ', this.state);
    let boardCopy = JSON.parse(JSON.stringify(this.state.board));
    let newTurn = this.state.turn;
    const turnCopy = this.state.turn;
    const row = params.pos.row;
    const col = params.pos.col;

    if(params.value !== 'R' && params.value !== 'B') {
      boardCopy[row][col].value = turnCopy;
      newTurn = (turnCopy == 'R') ? 'B' : 'R';
    }

    let newState = {
      board: boardCopy,
      turn: newTurn,
      pairs: this.state.pairs,
    }
    newState = this.checkPairs(newState, row, col);

    this.setState({
      board: newState.board,
      turn: newState.turn,
      pairs: newState.pairs,
    });

    if(this.checkForWin(newState.board) || this.state.pairs.R == 5 || this.state.pairs.B == 5) {
      alert('Game won! Winner: ' + turnCopy);
      this.reset();
    }
  }

  checkForWin(board) {
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

  checkPairs(state, row, col) {
    const board = state.board;
    const curVal = board[row][col].value;
    const oppVal = (curVal == 'R') ? 'B' : 'R';
    const wBound = w -3;
    let newState = state;
    const dirs = ['l', 'r', 'u', 'd', 'lu', 'ld', 'ru', 'rd'];

    for(var i=0; i < dirs.length; i++) {
      const dir = dirs[i];
      const left = (dir == 'l' || dir == 'lu' || dir == 'ld');
      const up = (dir == 'u' || dir == 'lu' || dir == 'ru');
      const rowDir = (up) ? -1 : 1;
      const colDir = (left) ? -1 : 1;
      let bound = true;
      let rowBound = true;
      let colBound = true;

      if(dir == 'lu' || dir == 'ru' || dir == 'u') {
        rowBound = row > 2;
      } else if(dir == 'ld' || dir == 'rd' || dir == 'd') {
        rowBound = row < wBound;
      }

      if(dir == 'lu' || dir == 'l' || dir == 'ld') {
        colBound = col > 2;
      } else if(dir == 'ru' || dir == 'r' || dir == 'rd'){
        colBound = col < wBound;
      }

      bound = colBound && rowBound;

      if(bound) {
        const outerRow = (dir == 'l' || dir == 'r') ? row : row + (3 * rowDir);
        const outerCol = (dir == 'u' || dir == 'd') ? col : col + (3 * colDir);
        if(board[outerRow][outerCol].value == curVal) {
          console.log('outer value == curVal');
          const row1 = (dir == 'l' || dir == 'r') ? row : row + rowDir;
          const row2 = (dir == 'l' || dir == 'r') ? row : row + (2 * rowDir);
          const col1 = (dir == 'u' || dir == 'd') ? col : col + colDir;
          const col2 = (dir == 'u' || dir == 'd') ? col : col + (2 * colDir);
          if(board[row1][col1].value == oppVal && board[row2][col2].value == oppVal) {
            newState.board[row1][col1].value = '';
            newState.board[row2][col2].value = '';
            newState.pairs[curVal] += 1;
            break;
          }
        }
      }
    }
    return newState;
  }

  reset() {
    this.setState({
      board: emptyBoard,
      turn: players[Math.floor(Math.random() * players.length)],
      pairs: {R: 0, B: 0},
    });
  }

  viewRules() {
    alert('Each player takes turn placing pieces on the board. If you place pieces on either side of two of the other players\' pieces (i.e. [R, B, B, R]), you take those pieces from the board and keep them. However, if you place two pieces between your opponents\' pieces, they do not take you pieces. To win, you must be the first player to place 5 pieces in a row either horizontally, vertically, or diagonally or collect 5 pairs of the other players\' pieces.');
  }

  render() {
    return (
      <div className="container">
         <RenderBoardLoop board={this.state.board} onClick={this.makeMove.bind(this)}/>
         <div className="turn">
           Current Player: {this.state.turn}
         </div>
         <div className="pairs">
           <p>Red pairs: {this.state.pairs.R}</p>
           <p>Black pairs: {this.state.pairs.B}</p> 
         </div>
         <button type="button" className="restart btn btn-warning" onClick={this.reset.bind(this)}>Restart</button>
         <button type="button" className="rules btn btn-info" onClick={this.viewRules.bind(this)}>View Rules</button>
      </div>
    );
  }
}

function RenderButton(params) {
  var makeMove=params.onClick;
  return (
    <button className="piece" onClick={() => makeMove(params)}>{params.value}</button>
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
