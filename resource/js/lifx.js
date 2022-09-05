var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define("form", ["require", "exports", "index"], function (require, exports, _1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var LifxForm = /** @class */ (function () {
        function LifxForm(client, form) {
            var _this = this;
            this.client = client;
            this.form = form;
            this.action = form.getAttribute('action') || '/';
            var inputs = form.querySelectorAll('input');
            this.inputs = [];
            inputs.forEach(function (input) {
                _this.inputs.push(new _1.LifxInput(_this, input));
            });
        }
        LifxForm.prototype.submit = function () {
            var formData = new FormData(this.form);
            var object = {};
            formData.forEach(function (value, key) {
                if (!object.hasOwnProperty(key))
                    object[key] = value;
                else {
                    if (!Array.isArray(object[key]))
                        object[key] = [object[key]];
                    object[key].push(value);
                }
            });
            console.log('submitting', this.action, object);
            this.client.post(this.action, object, function () {
            });
        };
        return LifxForm;
    }());
    exports.default = LifxForm;
});
define("input", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var LifxInput = /** @class */ (function () {
        function LifxInput(form, input) {
            this.form = form;
            this.input = input;
            this.name = input.getAttribute('name') || '';
            this.type = input.getAttribute('type') || 'text';
            this.upgrade();
        }
        LifxInput.prototype.upgrade = function () {
            if (this.input.getAttribute('onchange'))
                this.input.removeAttribute('onchange');
            if (this.hasType('checkbox'))
                this.upgradeCheckbox();
            else if (this.hasType('color'))
                this.upgradeColor();
            else
                this.upgradeDefault();
            this.input.addEventListener('change', function (e) {
                this.submit();
            }.bind(this));
        };
        LifxInput.prototype.submit = function () {
            var _this = this;
            if (this.submitTimeout)
                clearTimeout(this.submitTimeout);
            this.submitTimeout = setTimeout(function () {
                _this.form.submit();
            }, 50);
        };
        LifxInput.prototype.hasType = function (type) {
            return this.type === type;
        };
        LifxInput.prototype.upgradeColor = function () {
            var handler = function (e) {
                this.submit();
            }.bind(this);
            this.input.addEventListener('input', handler);
            this.input.addEventListener('change', handler);
        };
        LifxInput.prototype.upgradeCheckbox = function () {
            var slider = this.getField().querySelector('.slider');
            if (!slider)
                return;
            slider.removeAttribute('onclick');
            slider.addEventListener('click', function (e) {
                this.input.checked = !this.input.checked;
                this.submit();
            }.bind(this));
        };
        LifxInput.prototype.upgradeNumber = function () {
            // TODO
        };
        LifxInput.prototype.upgradeDefault = function () {
            this.input.addEventListener('change', this.submit.bind(this));
        };
        LifxInput.prototype.getField = function () {
            return this.input.parentElement;
        };
        return LifxInput;
    }());
    exports.default = LifxInput;
});
define("index", ["require", "exports", "client", "form", "input"], function (require, exports, client_1, form_1, input_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LifxInput = exports.LifxForm = exports.LifxClient = void 0;
    client_1 = __importDefault(client_1);
    form_1 = __importDefault(form_1);
    input_1 = __importDefault(input_1);
    exports.LifxClient = client_1.default;
    exports.LifxForm = form_1.default;
    exports.LifxInput = input_1.default;
});
define("interface", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isString = exports.isObject = exports.isWebsocketMessage = void 0;
    function isWebsocketMessage(message) {
        return isObject(message) &&
            isString(message.url) &&
            isObject(message.data) &&
            (message.method === 'get' || message.method === 'post');
    }
    exports.isWebsocketMessage = isWebsocketMessage;
    function isObject(obj) {
        return obj != null && typeof obj === 'object';
    }
    exports.isObject = isObject;
    function isString(str) {
        return str != null && typeof str === 'string';
    }
    exports.isString = isString;
});
define("client", ["require", "exports", "index"], function (require, exports, _2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var LifxClient = /** @class */ (function () {
        function LifxClient() {
            this.upgraded = false;
            this.upgrade();
            this.connect();
        }
        LifxClient.prototype.upgrade = function () {
            var _this = this;
            var forms = document.querySelectorAll('form');
            this.forms = [];
            forms.forEach(function (form) {
                _this.forms.push(new _2.LifxForm(_this, form));
            });
        };
        LifxClient.prototype.post = function (url, data, callback) {
            return this.send('post', url, data, callback);
        };
        LifxClient.prototype.send = function (method, url, data, callback) {
            if (this.ws && this.upgraded)
                this.ws.send(JSON.stringify({
                    method: method,
                    url: url,
                    data: data
                }));
            else
                this.ajax(method, url, data, callback);
        };
        LifxClient.prototype.ajax = function (method, url, data, callback) {
            var xhr = new XMLHttpRequest();
            xhr.open(method.toUpperCase(), url);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    if (callback)
                        try {
                            callback(JSON.parse(xhr.responseText));
                        }
                        catch (error) {
                            callback(null, error);
                        }
                }
            };
            xhr.send(JSON.stringify(data));
        };
        LifxClient.prototype.connect = function () {
            try {
                this.ws = new WebSocket('ws://' + window.location.host, ['json']);
                this.ws.addEventListener('open', function () {
                    console.log('ws listening');
                    this.upgraded = true;
                }.bind(this));
                this.ws.addEventListener('message', function (message) {
                    try {
                        this.receive(JSON.parse(message.data));
                    }
                    catch (error) {
                        console.log('Invalid JSON', message.data);
                    }
                }.bind(this));
            }
            catch (error) {
                console.log('ws error', error);
            }
        };
        LifxClient.prototype.receive = function (message) {
            console.log('got', JSON.stringify(message, null, 4));
        };
        return LifxClient;
    }());
    exports.default = LifxClient;
});
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
