
defmodule PenteWeb.GamesChannel do
	use PenteWeb, :channel

	alias Pente.Game

	# Handle the initial connection by the client (associate name and game with socket)
	def join("games:" <> name, payload, socket) do
		if authorized?(payload) do
			# Join or create a game with the given name
			game_info = Pente.GameManager.joinGame(name, socket.assigns.user_id)

			if game_info != nil do
				game = game_info["game"]

				socket = socket
				|> assign(:game, game)
				|> assign(:name, name)

				{:ok, %{"join" => name, "game" => Game.client_view(game)}, socket}
			else
				{:error, %{reason: "unable to join game"}}
			end
		else
			{:error, %{reason: "unauthorized"}}
		end
	end

	# NOTE: Does handle_in take messages from any socket connected to the channel?

	# TODO: All responses back to the client should have some information about whether they are p1 or p2

	# TODO:
	# - add broadcasts in actions to communicate to other channel topic/subtopic subs
	# - Test 

	# Do any necessary authorization checks for joining
	def authorized?(_payload) do
		true
	end

end
