class LifxClient {

    constructor() {
        this.alive = false;
    }

    ready(callback) {
        document.addEventListener('DOMContentLoaded', callback);
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
		var ws = new WebSocket('/')
	}
}

var lifx = new LifxClient();
