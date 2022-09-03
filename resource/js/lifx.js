class LifxClient {

    constructor() {
        this.alive = false;
    }

    ready(callback) {
        document.addEventListener('DOMContentLoaded', callback.bind(this));
    }

    post(form, callback) {
        var xhr = new XMLHttpRequest();
        var action = form.getAttribute('action');
        action += (action.indexOf('?') > 0 ? '&' : '?') + 'json=true';
        xhr.open('POST', action);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                if (callback)
                    callback(xhr.response);
            }
        };
        xhr.send(new URLSearchParams(new FormData(form)));
    }

	connect() {
		try {
			var ws = new WebSocket('ws://' + window.location.host, ['json']);
			ws.addEventListener('open', () => {
				ws.send(JSON.stringify({ hey: 'there' }));
			});
			ws.addEventListener('message', (message) => {
				console.log(message.data);
			});
		}
		catch (error) {
			console.log(error)
		}
	}
}

var lifx = new LifxClient();
lifx.ready(function() {
	lifx.connect();
});
