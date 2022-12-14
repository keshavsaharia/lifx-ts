import {
	Keypress
} from './interface'

export function repeated(str: string | null, times: number) {
	if (str == null)
		return ''
	return new Array(times).fill(str).join('')
}

export function getKey(s: string) {
	const key: Keypress = {
		ctrl: false,
		meta: false,
		shift: false,
		sequence: s
	}
	let parts: RegExpExecArray | null

	if (s === '\r')
		key.name = 'return'
	else if (s === '\n')
		key.name = 'enter'
	else if (s === '\t')
		key.name = 'tab'
	// backspace or ctrl+h
	else if (s === '\b' || s === '\x7f' || s === '\x1b\x7f' || s === '\x1b\b') {
		key.name = 'backspace'
		key.meta = (s.charAt(0) === '\x1b')
	}
	// escape key
	else if (s === '\x1b' || s === '\x1b\x1b') {
		key.name = 'escape'
		key.exit = true
		key.meta = (s.length === 2)
	}
	else if (s === ' ' || s === '\x1b ') {
		key.name = 'space'
		key.meta = (s.length === 2)
	}
	// ctrl+letter
	else if (s <= '\x1a') {
		key.name = String.fromCharCode(s.charCodeAt(0) + 'a'.charCodeAt(0) - 1)
		key.ctrl = true
	}
	// lowercase letter
	else if (s.length === 1 && s >= 'a' && s <= 'z') {
		key.name = s
	}
	// shift + letter
	else if (s.length === 1 && s >= 'A' && s <= 'Z') {
		key.name = s.toLowerCase()
		key.shift = true
	}
	// meta + character key
	else if (parts = /^(?:\x1b)([a-zA-Z0-9])$/.exec(s)) {
		key.name = parts[1].toLowerCase()
		key.meta = true
		key.shift = /^[A-Z]$/.test(parts[1])
	}
	// ansi escape sequence
	else if (parts = /^(?:\x1b+)(O|N|\[|\[\[)(?:(\d+)(?:;(\d+))?([~^$])|(?:1;)?(\d+)?([a-zA-Z]))/.exec(s)) {
		const code = (parts[1] || '') + (parts[2] || '') + (parts[4] || '') + (parts[6] || '')
		const modifier = parseInt(parts[3] || parts[5] || '1') - 1;

		// Parse the key modifier
		key.ctrl = !!(modifier & 4)
		key.meta = !!(modifier & 10)
		key.shift = !!(modifier & 1)
		key.code = code

		// Parse the key itself
		switch (code) {
			/* xterm/gnome ESC O letter */
			case 'OP': key.name = 'f1'; break;
			case 'OQ': key.name = 'f2'; break;
			case 'OR': key.name = 'f3'; break;
			case 'OS': key.name = 'f4'; break;

			/* xterm/rxvt ESC [ number ~ */
			case '[11~': key.name = 'f1'; break;
			case '[12~': key.name = 'f2'; break;
			case '[13~': key.name = 'f3'; break;
			case '[14~': key.name = 'f4'; break;

			/* from Cygwin and used in libuv */
			case '[[A': key.name = 'f1'; break;
			case '[[B': key.name = 'f2'; break;
			case '[[C': key.name = 'f3'; break;
			case '[[D': key.name = 'f4'; break;
			case '[[E': key.name = 'f5'; break;

			/* common */
			case '[15~': key.name = 'f5'; break;
			case '[17~': key.name = 'f6'; break;
			case '[18~': key.name = 'f7'; break;
			case '[19~': key.name = 'f8'; break;
			case '[20~': key.name = 'f9'; break;
			case '[21~': key.name = 'f10'; break;
			case '[23~': key.name = 'f11'; break;
			case '[24~': key.name = 'f12'; break;

			/* xterm ESC [ letter */
			case '[A': key.name = 'up'; break;
			case '[B': key.name = 'down'; break;
			case '[C': key.name = 'right'; break;
			case '[D': key.name = 'left'; break;
			case '[E': key.name = 'clear'; break;
			case '[F': key.name = 'end'; break;
			case '[H': key.name = 'home'; break;

			/* xterm/gnome ESC O letter */
			case 'OA': key.name = 'up'; break;
			case 'OB': key.name = 'down'; break;
			case 'OC': key.name = 'right'; break;
			case 'OD': key.name = 'left'; break;
			case 'OE': key.name = 'clear'; break;
			case 'OF': key.name = 'end'; break;
			case 'OH': key.name = 'home'; break;

			/* xterm/rxvt ESC [ number ~ */
			case '[1~': key.name = 'home'; break;
			case '[2~': key.name = 'insert'; break;
			case '[3~': key.name = 'delete'; break;
			case '[4~': key.name = 'end'; break;
			case '[5~': key.name = 'pageup'; break;
			case '[6~': key.name = 'pagedown'; break;

			/* putty */
			case '[[5~': key.name = 'pageup'; break;
			case '[[6~': key.name = 'pagedown'; break;

			/* rxvt */
			case '[7~': key.name = 'home'; break;
			case '[8~': key.name = 'end'; break;

			/* rxvt keys with modifiers */
			case '[a': key.name = 'up'; key.shift = true; break;
			case '[b': key.name = 'down'; key.shift = true; break;
			case '[c': key.name = 'right'; key.shift = true; break;
			case '[d': key.name = 'left'; key.shift = true; break;
			case '[e': key.name = 'clear'; key.shift = true; break;

			case '[2$': key.name = 'insert'; key.shift = true; break;
			case '[3$': key.name = 'delete'; key.shift = true; break;
			case '[5$': key.name = 'pageup'; key.shift = true; break;
			case '[6$': key.name = 'pagedown'; key.shift = true; break;
			case '[7$': key.name = 'home'; key.shift = true; break;
			case '[8$': key.name = 'end'; key.shift = true; break;

			case 'Oa': key.name = 'up'; key.ctrl = true; break;
			case 'Ob': key.name = 'down'; key.ctrl = true; break;
			case 'Oc': key.name = 'right'; key.ctrl = true; break;
			case 'Od': key.name = 'left'; key.ctrl = true; break;
			case 'Oe': key.name = 'clear'; key.ctrl = true; break;

			case '[2^': key.name = 'insert'; key.ctrl = true; break;
			case '[3^': key.name = 'delete'; key.ctrl = true; break;
			case '[5^': key.name = 'pageup'; key.ctrl = true; break;
			case '[6^': key.name = 'pagedown'; key.ctrl = true; break;
			case '[7^': key.name = 'home'; key.ctrl = true; break;
			case '[8^': key.name = 'end'; key.ctrl = true; break;

			/* misc. */
			case '[Z': key.name = 'tab'; key.shift = true; break;
			default: key.name = 'undefined'; break;
		}
	}

	if (key.ctrl && (key.name == 'c' || key.name == 'd')) {
		key.exit = true
	}

	// Don't emit a key if no name was found
	if (! key.name) {
		return null
	}

	return key
}
