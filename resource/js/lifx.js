function LifxClient() {
	this.alive = false;
}

LifxClient.prototype.ready = function(callback) {
	document.addEventListener('DOMContentLoaded', callback);
}

LifxClient.prototype.post = function(form, callback) {
	var xhr = new XMLHttpRequest();
	var action = form.getAttribute('action');
	action += (action.indexOf('?') > 0 ? '&' : '?') + 'json=true';
	xhr.open('POST', action);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			if (callback)
				callback(xhr.response);
		}
	}

	xhr.send(new URLSearchParams(new FormData(form)));
}

var lifx = new LifxClient();
