import {
	LifxForm
} from '.'

import {
	RequestData,
	WebsocketMessage,
	ResponseHandler
} from './interface'

export default class LifxClient {
	ws: WebSocket
	upgraded = false

	forms: Array<LifxForm>

    constructor() {
		this.upgrade()
		this.connect()
    }

	upgrade() {
		var forms = document.querySelectorAll('form')
		this.forms = []
		forms.forEach((form) => {
			this.forms.push(new LifxForm(this, form))
		})
	}

	post(url: string, data: RequestData, callback?: ResponseHandler) {
		return this.send('post', url, data, callback)
	}

	send(method: string, url: string, data: RequestData, callback?: ResponseHandler) {
		if (this.ws && this.upgraded)
			this.ws.send(JSON.stringify({
				method,
				url,
				data
			} as WebsocketMessage))
		else
			this.ajax(method, url, data, callback)
	}

    ajax(method: string, url: string, data: RequestData, callback?: ResponseHandler) {
        var xhr = new XMLHttpRequest()
        xhr.open(method.toUpperCase(), url)
		xhr.setRequestHeader('Content-Type', 'application/json')

        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                if (callback)
                    try {
						callback(JSON.parse(xhr.responseText))
					}
					catch (error) {
						callback(null, error)
					}
            }
        }
        xhr.send(JSON.stringify(data))
    }

	connect() {
		try {
			this.ws = new WebSocket('ws://' + window.location.host, ['json']);
			this.ws.addEventListener('open', function() {
				console.log('ws listening')
				this.upgraded = true
			}.bind(this));
			this.ws.addEventListener('message', function(message) {
				try {
					this.receive(JSON.parse(message.data))
				}
				catch (error) {
					console.log('Invalid JSON', message.data)
				}
			}.bind(this));
		}
		catch (error) {
			console.log('ws error', error)
		}
	}

	receive(message: WebsocketMessage) {
		console.log('got', JSON.stringify(message, null, 4))
	}
}

//
// function upgradeForm(form) {
// 	var inputs = form.querySelectorAll('input');
// 	inputs.forEach(function(input) {
// 		upgradeInput(form, input);
// 	})
// }
//
// function upgradeInput(form, input) {
// 	if (input.getAttribute('onchange')) {
// 		input.removeAttribute('onchange');
// 		var key = input.getAttribute('name');
// 		var type = input.getAttribute('type');
//
// 		input.addEventListener('change', function(e) {
// 			submitForm(form)
// 		});
//
// 		if (type == 'checkbox' && input.nextSibling && input.nextSibling.className.indexOf('slider') >= 0) {
// 			var slider = input.nextSibling;
// 			slider.removeAttribute('onclick');
// 			slider.addEventListener('click', function(e) {
// 				input.checked = !input.checked;
// 				submitForm(form)
// 			})
// 		}
// 	}
// }
//
// function submitForm(form) {
// 	lifx.post(form, function(result) {
//
// 	})
// }
//
// function JSONform(form) {
//
// }
//
// var lifx = new LifxClient();
// lifx.ready(function() {
// 	lifx.connect();
// });
