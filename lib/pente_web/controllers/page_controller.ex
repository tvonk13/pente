defmodule PenteWeb.PageController do
  use PenteWeb, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end
end
