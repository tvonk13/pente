# Manages creation and joining of multiplayer games. Stores connection information and the game state, similar to a backup
defmodule Pente.GameManager do
	use Agent
	alias Pente.Game

	def start_link do
		Agent.start_link(fn -> %{} end, name: __MODULE__)
	end

	# Join a game, creating it if necessary
	def joinGame(name, socket_id) do
		# Get the game info if it exists
		game_info = Agent.get __MODULE__, fn state ->
            Map.get(state, name)
        end

		# Game exists
		if game_info do
			# Waiting for second player
			if game_info["p2"] == nil do
				info = %{"game" => game_info["game"], 
						"p1" => game_info["p1"], 
						"p2" => socket_id}
				Agent.update __MODULE__, fn state ->
					Map.put(state, name, info)
				end
			# The game is full
			else
				# TODO: Throw some kind of error?
				nil
			end

		# Game doesn't exist yet, create it
		else
			game = Game.new()
			Agent.update __MODULE__, fn state ->
            	info = %{"game" => game, "p1" => socket_id, "p2" => nil}
            	Map.put(state, name, info)
        	end
		end
	end
			
	# Get a game record by name if it exists
	def getGame(name) do
		Agent.get __MODULE__, fn state ->
			Map.get(state, name)
		end
	end

end
