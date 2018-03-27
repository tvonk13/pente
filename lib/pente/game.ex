
# Module for server-side game logic, including processing user actions and rendering client views(?)
defmodule Pente.Game do

	@boardWidth 7
	@winLength 5

	# STATE
	# - Grid states
	# - Who's turn (player 1 or 2)
	# - Winner (null, 1, or 2)

	# Get a new initial state
	def new do

		board = %{
			0 => %{0 => "",1 => "",2 => "",3 => "",4 => "",5 => "",6 => ""},
			1 => %{0 => "",1 => "",2 => "",3 => "",4 => "",5 => "",6 => ""},
			2 => %{0 => "",1 => "",2 => "",3 => "",4 => "",5 => "",6 => ""},
			3 => %{0 => "",1 => "",2 => "",3 => "",4 => "",5 => "",6 => ""},
			4 => %{0 => "",1 => "",2 => "",3 => "",4 => "",5 => "",6 => ""},
			5 => %{0 => "",1 => "",2 => "",3 => "",4 => "",5 => "",6 => ""},
			6 => %{0 => "",1 => "",2 => "",3 => "",4 => "",5 => "",6 => ""},
		}

		# Turn can be either 0 or 1
		turn = "R"

		# Count the pairs achieved for each player
		pairs = %{"R" => 0, "B" => 0}

		# Return the new state
		%{"board" => board, "turn" => turn, "pairs" => pairs, "winner" => ""}
	end

	# Swap R to B and vice versa
	def changeTurn(turn) do
		if turn == "R" do
			"B"
		else
			"R"
		end
	end

	# Method for player action
	def makeMove(game, x, y) do

		board = game["board"]
		curTurn = game["turn"]
		
		targetVal = board[x][y]

		# TODO: Handle untrustworthy client? (Clicked space is not empty, etc?)

		# If space is empty
		if targetVal == "" do
			# Update the value for the clicked space
			board = put_in board[x][y], curTurn
			game = put_in game["board"], board
		end

		# Check for pairs around enemy pieces (Update board if necessary)
		game = checkPairs(game, x, y)
		board = game["board"]

		# Check win conditions on the updated state, and set winner if applicable
		if checkLineWin(board) || game["pairs"][curTurn] >= 5 do
			game = put_in game["winner"], curTurn
		end
		
		# Return the modified game state, updating the current player turn at the end
		put_in game["turn"], changeTurn(curTurn)

	end

	# Helper to call recursive function with proper accumulator
	def checkPairs(game, x, y) do
		checkPairs(game, x, y, 0)
	end

	# Check for pairs for the current move, updating the game state if necessary
	def checkPairs(game, row, col, dirIndex) do
		dirs = ['l', 'r', 'u', 'd', 'lu', 'ld', 'ru', 'rd']
		board = game["board"]
		curTurn = game["turn"]
		oppTurn = changeTurn(curTurn)
		wbound = @boardWidth - 3

		# All dirs have been checked, return the current state
		if dirIndex > 7 do
			game
		
		# Otherwise check the current direction
		else
			# Get the current direction to check
			dir = Enum.at(dirs, dirIndex)

			rowDir = if (dir == 'u' || dir == 'lu' || dir == 'ru'), do: -1, else: 1
			colDir = if (dir == 'l' || dir == 'lu' || dir == 'ld'), do: -1, else: 1
			rowBound = true
			colBound = true

			# Check if row exceeds bound for possible pair taking
			if dir == 'lu' || dir == 'ru' || dir == 'u' do
				rowBound = row > 2
			else 
				if dir == 'ld' || dir == 'rd' || dir == 'd' do
					rowBound = row < wbound
				end
			end

			# Check if col exceeds bound for possible pair taking
			if dir == 'lu' || dir == 'l' || dir == 'ld' do
				colBound = col > 2
			else 
				if dir == 'ru' || dir == 'r' || dir == 'rd' do
					colBound = col < wbound
				end
			end

			bound = rowBound && colBound

			# If we are within bounds for taking a pair, check pieces
			if bound do
				# Check if the current player has a piece on the other side of 2 spaces
				outerRow = if (dir == 'l' || dir == 'r'), do: row, else: 3 * rowDir
				outerCol = if (dir == 'u' || dir == 'd'), do: col, else: 3 * colDir
				
				if board[outerRow][outerCol] == curTurn do
					# Check if 2 inner spaces both have opponent pieces
					row1 = if (dir == 'l' || dir == 'r'), do: row, else: row + rowDir
					row2 = if (dir == 'l' || dir == 'r'), do: row, else: row + (2 * rowDir)
					col1 = if (dir == 'u' || dir == 'd'), do: col, else: col + colDir
					col2 = if (dir == 'u' || dir == 'd'), do: col, else: col + (2 * colDir)

					if (board[row1][col1] == oppTurn && board[row2][col2] == oppTurn) do
						# Valid capture: Update the game state
						game = put_in game["board"][row1][col1], ""
						game = put_in game["board"][row2][col2], ""
						game = put_in game["pairs"][curTurn], game["pairs"][curTurn] + 1
					end
				end
			end

			# Recurse to next direction
			checkPairs(game, row, col, dirIndex + 1)
		end
	end

	# Wrapper for checkLineWin that initializes the correct accumulators
	def checkLineWin(board) do
		checkLineWin(board, 0, 0)
	end

	# Iterate over every grid location to check for winning condition
	def checkLineWin(board, row, col) do

		cond do

			# Finished iterating rows, return false if this far
			row >= @boardWidth ->
				false

			# If the check on current pos returns win (true)
			isWin(board, row, col) ->
				true
			
			# Recurse to next row if at end of row
			col >= @boardWidth - 1 ->
				checkLineWin(board, row + 1, 0)

			# Otherwise recurse to next col
			true ->
				checkLineWin(board, row, col + 1)
		end
	end

	# Checks whether the given pos is part of a winning line on the board
	# (Delegates to check each direction)
	def isWin(board, row, col) do
		checkVert(board, row, col, 0) ||
		checkHoriz(board, row, col, 0) ||
		checkRDiagonal(board, row, col, 0) ||
		checkLDiagonal(board, row, col, 0)
	end

	##########################
	#    NOTE
	# Since we are checking every grid space, we only need to search
	# in one direction for each orientation.
	# i.e. For vertical checks, treat starting point as bottom only
	##########################

	# Check vertical
	def checkVert(board, row, col, dif) do
		curVal = board[row][col]

		# Only check non-empty lines that fit on the board
		if row < @boardWidth - @winLength && curVal != "" do
			matching = curVal == board[row + dif][col]

			# End of the checked line, stop recursing
			if dif >= @winLength - 1 do
				matching
			# Continue down the line being checked
			else
				matching && checkVert(board, row, col, dif + 1)
			end

		# Not a valid line
		else
			false
		end 
	end

	# Check horizontal
	def checkHoriz(board, row, col, dif) do
		curVal = board[row][col]

		# Only check non-empty lines that fit on the board
		if col < @boardWidth - @winLength && curVal != "" do
			matching = curVal == board[row][col + dif]

			# End of the checked line, stop recursing
			if dif >= @winLength - 1 do
				matching
			# Continue down the line being checked
			else
				matching && checkHoriz(board, row, col, dif + 1)
			end

		# Not a valid line
		else
			false
		end 
	end

	# Check right diagonal (bot left to top right)
	def checkRDiagonal(board, row, col, dif) do
		curVal = board[row][col]

		# Only check non-empty lines that fit on the board
		if col < @boardWidth - @winLength 
				&& row > @boardWidth - @winLength
				&& curVal != "" do

			matching = curVal == board[row + dif][col + dif]

			# End of the checked line, stop recursing
			if dif >= @winLength - 1 do
				matching
			# Continue down the line being checked
			else
				matching && checkRDiagonal(board, row, col, dif + 1)
			end

		# Not a valid line
		else
			false
		end 
	end

	# Check left diagonal (top left to bot right)
	def checkLDiagonal(board, row, col, dif) do
		curVal = board[row][col]

		# Only check non-empty lines that fit on the board
		if col < @boardWidth - @winLength 
				&& row > @winLength
				&& curVal != "" do

			matching = curVal == board[row - dif][col + dif]

			# End of the checked line, stop recursing
			if dif >= @winLength - 1 do
				matching
			# Continue down the line being checked
			else
				matching && checkLDiagonal(board, row, col, dif + 1)
			end

		# Not a valid line
		else
			false
		end 
	end



	# Restart: Set a new state for the game (reset board and score, etc)
	def restartGame(game) do
		new()
	end

	def client_view(game) do
		#game
		board = game["board"]
		board = Enum.reduce(board, [], fn(row, acc) -> acc ++ [Enum.reduce(elem(row, 1), [], fn(x, acc) -> acc ++ [elem(x, 1)] end)] end)

		put_in game["board"], board
	end

end
