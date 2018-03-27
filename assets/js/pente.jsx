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
        row.push({ value: '', pos: { row: i, col: j }, color: 'white', opacity: 0});
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
    color: String // oneOf: 'black', 'red', 'white'
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

    makeMove(params) {
        let boardCopy = JSON.parse(JSON.stringify(this.state.board));
        let newTurn = this.state.turn;
        const turnCopy = this.state.turn;
        const row = params.pos.row;
        const col = params.pos.col;

        if (params.value !== 'R' && params.value !== 'B') { //if space is empty
            boardCopy[row][col].value = turnCopy; //set value to the current turn
            boardCopy[row][col].color = (turnCopy == 'R') ? 'red' : 'black';
            boardCopy[row][col].opacity = 1;
            newTurn = (turnCopy == 'R') ? 'B' : 'R'; //update turn to the other player
        }

        let pairState = {
            board: boardCopy,
            turn: newTurn,
            pairs: this.state.pairs,
        }
        //check if updated space creates pair-taking condition and update state accordingly
        pairState = this.checkPairs(pairState, row, col);

        this.setState(pairState);//set state to updated pairState

        //check if pieces in a line or 5 pair win conditions have been met
        if (this.checkForLineWin(pairState.board) || this.state.pairs.R == 5 || this.state.pairs.B == 5) {
            alert(((turnCopy == 'R') ? 'Red' : 'Black') + ' won!');
            this.reset(); //reset board
        }
    }

    //using the given board, check if there are 5 pieces in a line anywhere on the board
    checkForLineWin(board) {
        let isWon = false;

        //for every space in the board
        for (var row = 0; row < board.length; row++) {
            for (var col = 0; col < board.length; col++) {
                //check horizontal, vertical, and diagonal directions for 5 pieces in a line
                isWon = this.isWonWrapper(board, row, col);
                if (isWon) {
                    return true;
                }
            }
        }
        return false;
    }

    //check horizontal, vertical, and diagonal directions from the given position for 5 pieces in a line
    isWonWrapper(board, row, col) {
        return this.checkVertHoriz(board, row, col, 'h') || this.checkVertHoriz(board, row, col, 'v') || this.checkDiagonal(board, row, col, 'l') || this.checkDiagonal(board, row, col, 'r');
    }

    //check horizontal or vertical direction (based on dir - 'h' or 'v') from the given position for 5 pieces in a line
    checkVertHoriz(board, row, col, dir) {
        const space = board[row][col];
        const curVal = space.value;
        //if dir is 'h', check horizontal, else check vertical
        const index = (dir == 'h') ? col : row;
        let nextVal = space.value;
        let count = 0;

        if (curVal != '') {
            //starting from either 4 spaces away or the farthest edge from the given position to the given position
            for (var i = Math.max(index - wL, 0); i <= index; i++) {
                count = 0;
                //iterate through chunks of 5 to check for 5 in a line
                for (var j = i; j < Math.min(i + winLength, w); j++) {
                    if (j < w) {
                        nextVal = (dir == 'h') ? board[row][j].value : board[j][col].value;
                        if (nextVal == curVal) {
                            count++;
                        } else {
                            count = 0;
                            break;
                        }
                    }
                }
                if (count == winLength) {
                    return true;
                }
            }
        }
        return false;
    }

    //check diagonal direction (based on dir - 'r' or 'l') from the given position for 5 pieces in a line
    checkDiagonal(board, row, col, dir) {
        const space = board[row][col];
        const curVal = space.value;
        let nextVal = space.value;
        let count = 0;
        //if dir is 'r' check diagonal direction from upper left to lower right
        //otherwise check from upper right to lower left
        const loopDir = (dir == 'r') ? (-1) : 1;

        if (curVal != '') {
            //find the furthest out diagonally in each direction, up to 4 spaces away, 
            //from the given position that doesn't go out of bounds
            const colMax = Math.min(col + wL, w - 1);
            const colMin = Math.max(col - wL, 0);
            const rowMax = Math.min(row + wL, w - 1);
            const rowMin = Math.max(row - wL, 0);
            //based on the given direction, determine starting column position
            var cInit = (dir == 'r') ? colMax : colMin;

            //starting from 4 away from the given position to 4 away in the opposite direction
            for (var r = rowMin, c = cInit; r <= rowMax; c += loopDir, r++) {
                nextVal = board[r][c].value;
                if (nextVal == curVal) {
                    count++;
                    if (count == winLength) {
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

    //check if the given position captures a pair of the opponents pieces
    checkPairs(state, row, col) {
        const board = state.board;
        const curVal = board[row][col].value;
        const oppVal = (curVal == 'R') ? 'B' : 'R';
        const wBound = w - 3; //if the position is less than 3 away from the edge, it can't take a pair in that direction
        var newState = state;
        const dirs = ['l', 'r', 'u', 'd', 'lu', 'ld', 'ru', 'rd']; // possible directions in which a pair can be taken

        //for each direction
        for (var i = 0; i < dirs.length; i++) {
            const dir = dirs[i];
            //determine iteration direction based on current dir
            const rowDir = (dir == 'u' || dir == 'lu' || dir == 'ru') ? -1 : 1;
            const colDir = (dir == 'l' || dir == 'lu' || dir == 'ld') ? -1 : 1;
            let bound = true;
            let rowBound = true;
            let colBound = true;

            //check if row exceeds bound for possible pair taking
            if (dir == 'lu' || dir == 'ru' || dir == 'u') {
                rowBound = row > 2;
            } else if (dir == 'ld' || dir == 'rd' || dir == 'd') {
                rowBound = row < wBound;
            }

            //check if col excedds bound for possible pair taking
            if (dir == 'lu' || dir == 'l' || dir == 'ld') {
                colBound = col > 2;
            } else if (dir == 'ru' || dir == 'r' || dir == 'rd') {
                colBound = col < wBound;
            }

            bound = colBound && rowBound;

            if (bound) { //if col and dir are within possible bounds for taking a pair
                //check if current player has a piece on the other side of 2 spaces
                const outerRow = (dir == 'l' || dir == 'r') ? row : row + (3 * rowDir);
                const outerCol = (dir == 'u' || dir == 'd') ? col : col + (3 * colDir);
                if (board[outerRow][outerCol].value == curVal) {
                    //check if 2 inner spaces both have opponent pieces
                    const row1 = (dir == 'l' || dir == 'r') ? row : row + rowDir;
                    const row2 = (dir == 'l' || dir == 'r') ? row : row + (2 * rowDir);
                    const col1 = (dir == 'u' || dir == 'd') ? col : col + colDir;
                    const col2 = (dir == 'u' || dir == 'd') ? col : col + (2 * colDir);
                    if (board[row1][col1].value == oppVal && board[row2][col2].value == oppVal) {
                        //"remove" pieces from board and update current players' number of pairs taken  
                        var space1 = newState.board[row1][col1];
                        var space2 = newState.board[row2][col2];
                        space1.value = '';
                        space1.color = 'white';
                        space1.opacity = 0;
                        space2.value = '';
                        space2.color = 'white';
                        space2.opacity = 0;
                        newState.pairs[curVal] += 1;
                        break;
                    }
                }
            }
        }
        return newState;
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
            <div className="container">
                <div className="board-wrapper">
                    <div className="grid-lines">
                        <RenderGrid board={this.state.board} />
                    </div>
                    <div className="board">
                        <RenderBoardLoop board={this.state.board} onClick={this.makeMove.bind(this)} />
                    </div>
                </div>
                <div className="info">
                    <div className="turn" style={{ color: turnColor }}>
                        {(this.state.turn == 'R') ? 'Red' : 'Black'}'s turn
                    </div>
                    <div className="pairs">
                        <RenderPairTable redPairs={this.state.pairs.R} blackPairs={this.state.pairs.B} />
                    </div>
                    <button type="button" className="restart btn btn-warning" onClick={this.reset.bind(this)}>Restart</button>
                    <button type="button" className="rules btn btn-info" onClick={this.viewRules.bind(this)}>View Rules</button>
                </div>
            </div>
        );
    }
}

function RenderButton(params) {
    var makeMove = params.onClick;
    var bgColor = params.color;
    const bgOpacity = params.opacity;
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
                        <RenderButton key={j} value={space.value} pos={space.pos} onClick={params.onClick} color={space.color} opacity={space.opacity} />
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
    for (var i = 0; i <= 5; i++) {
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
            <div className="row pairRow">
                <div className="pairRowName">Red</div>
                {redArr.map((pair, i) =>
                    <RenderPair key={i}pair={pair} color='black' />
                )}
            </div>
            <div className="row pairRow">
                <div className="pairRowName">Black</div>
                {blackArr.map((pair, i) =>
                    <RenderPair key={i} pair={pair} color='red' />
                )}
            </div>
        </div>
    );
}
