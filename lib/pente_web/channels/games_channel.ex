
defmodule PenteWeb.GamesChannel do
	use PenteWeb, :channel

	alias Pente.Game
	alias Pente.GameManager

	# Handle the initial connection by the client (associate name and game with socket)
	def join("games:" <> name, payload, socket) do
		if authorized?(payload) do
			# Join or create a game with the given name
			game_info = GameManager.joinGame(name, socket.assigns.user_id)

			if game_info != nil do
				game = game_info["game"]

				color = if (game_info["p1"] == socket.assigns.user_id), do: "R", else: "B"

				socket = socket
				|> assign(:game, game)
				|> assign(:name, name)
				|> assign(:color, color)

				{:ok, %{"join" => name, "game" => Game.client_view(game, color), }, socket}
			else
				{:error, %{reason: "unable to join game"}}
			end
		else
			{:error, %{reason: "unauthorized"}}
		end
	end

	# Handle the event for a player move
	def handle_in("player_move", %{"row" => row, "col" => col}, socket) do

		# Get the current state
		game = socket.assigns[:game]
		curTurn = game["turn"]

		# Do nothing if:
		# - It is not our turn
		# - Clicked space is not empty
		# - Game is over
		if (curTurn != socket.assigns.color ||
				game["board"][row][col] != "" ||
				game["winner"] != "") do
			{:reply, {:ok, %{ "game" => Game.client_view(game, socket.assigns.color)}}, socket}

		# Its our turn, make the move
		else
			# Get the new game state
			game = Game.makeMove(game, row, col)

			# Set new state in socket
			socket = assign(socket, :game, game)

			# Set new state in game manager
			GameManager.updateGame(game, socket.assigns.name)

			# Broadcast new state to channel
			broadcast! socket, "new_state", %{"game" => Game.client_view(game, socket.assigns.color), "s_game" => game}

			{:reply, {:ok, %{ "game" => Game.client_view(game, socket.assigns.color)}}, socket}
		end
	end

	# Handle the event for a restart
	def handle_in("restart", _params, socket) do
		# Generate a new game state
		newGame = Game.new
		
		# Set the new state in the game manager
		GameManager.updateGame(newGame, socket.assigns.name)

		# Broadcast new state
		broadcast! socket, "new_state", %{"game" => Game.client_view(newGame, socket.assigns.color), "s_game" => newGame}

		{:reply, {:ok, %{ "game" => Game.client_view(newGame, socket.assigns.color)}}, socket}
	end

	# Handle new_state broadcast from other clients
	intercept ["new_state"]
	def handle_out("new_state", %{"game" => client_game, "s_game" => game}, socket) do
		# Make sure the new game state is set in the socket
		socket = assign(socket, :game, game)

		# Forward on the message to the client
		push socket, "new_state", %{"game" => client_game}

		{:noreply, socket}
	end

	# Do any necessary authorization checks for joining
	def authorized?(_payload) do
		true
	end

end
