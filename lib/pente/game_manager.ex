# Manages creation and joining of multiplayer games. Stores connection information and the game state, similar to a backup
defmodule Pente.GameManager do
	use Agent
	alias Pente.Game

	def start_link do
		Agent.start_link(fn -> %{} end, name: __MODULE__)
	end

	# Join a game, creating it if necessary
	def joinGame(name, user_id) do
		# Get the game info if it exists
		game_info = Agent.get __MODULE__, fn state ->
            Map.get(state, name)
        end

		cond do
			# Game doesn't exist yet, create it
			!game_info ->
				IO.puts "Starting new game: #{name}"
				game = Game.new()
				Agent.update __MODULE__, fn state ->
            		info = %{"game" => game, "p1" => user_id, "p2" => nil}
            		Map.put(state, name, info)
        		end
				getGame(name)
				
			# Player is already in the game
			game_info["p1"] == user_id || game_info["p2"] == user_id ->
				IO.puts "Player returning: #{user_id}"
				game_info

			# Waiting for second player
			game_info["p2"] == nil ->
				IO.puts "Joining game: #{name}"
				IO.puts "This user: #{user_id}"
				info = %{"game" => game_info["game"], 
						"p1" => game_info["p1"], 
						"p2" => user_id}
				Agent.update __MODULE__, fn state ->
					Map.put(state, name, info)
				end
				getGame(name)

			# Else, the game is full
			true ->
				IO.puts "Failed to join full game: #{name}"
				nil
		end

	end
			
	# Get a game record by name if it exists
	def getGame(name) do
		Agent.get __MODULE__, fn state ->
			Map.get(state, name)
		end
	end

	# Update the game state stored in the agent
	def updateGame(game, name) do
		# Get the current game info
		game_info = Agent.get __MODULE__, fn state ->
            Map.get(state, name)
        end

		info = put_in game_info["game"], game

		# Put the new game_info back into the agent map
		Agent.update __MODULE__, fn state ->
			Map.put(state, name, info)
		end

		# Return the updated game
		getGame(name)
	end
end
