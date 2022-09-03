lifx.ready(function() {
	var forms = document.querySelectorAll('form');
	forms.forEach(upgradeForm);
});

function upgradeForm(form) {
	var inputs = form.querySelectorAll('input');
	inputs.forEach(function(input) {
		upgradeInput(form, input);
	})
}

function upgradeInput(form, input) {
	if (input.getAttribute('onchange')) {
		input.removeAttribute('onchange');
		var key = input.getAttribute('name');
		var type = input.getAttribute('type');

		input.addEventListener('change', function(e) {
			submitForm(form)
		});

		if (type == 'checkbox' && input.nextSibling && input.nextSibling.className.indexOf('slider') >= 0) {
			var slider = input.nextSibling;
			slider.removeAttribute('onclick');
			slider.addEventListener('click', function(e) {
				input.checked = !input.checked;
				submitForm(form)
			})
		}
	}
}

function submitForm(form) {
	lifx.post(form, function(result) {

	})
}
