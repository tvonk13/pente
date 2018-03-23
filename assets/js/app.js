import "phoenix_html";
import socket from "./socket";

import run_pente from "./pente";

function start() {
	let root = document.getElementById('root');
	if (root) {
		let channel = socket.channel("games:" + window.gameName, {});
		run_pente(root, channel);
	}

	if (document.getElementById('index-page')) {
		//form_init();
	}
}

$(start);
