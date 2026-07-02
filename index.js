const REMOVE = {
	comma: 			[{reg: /,|\.|，|。/g, replacement: ""},],
	space: 			[{reg: /( |　)/g, replacement: ""},],
	return: 		[{reg: /\n/g, replacement: ""},],
	tab: 				[{reg: /\t/g, replacement: ""},],
	quot: 			[{reg: /[“”"']/g, replacement: ""},] ,
	whiteReturn: [{reg: /(^\s*?(\n|\r\n|\r))+/g, replacement: ""},],
	bracket:		[{reg: /(\(|\)|（|）)/g, replacement: ""},],
	htmlTag:		[{reg: /<.+?>|<\/.+?>/g, replacement: ""},],
	book: [{reg: /\<|\>|《|》/g, replacement: ""},],
	squareBracket: [{reg: /\[|\]|【|】/g, replacement: ""},],
	backslash: [{reg: /\\|、/g, replacement: ''}],
	letter: [{reg: /[a-zA-Z]/g, replacement: ''}],
	number: [{reg: /\d/g, replacement: ''}],
	all: []
}

REMOVE.all = [].concat(
	REMOVE.comma,
	REMOVE.space, REMOVE.return,
	REMOVE.quot, REMOVE.whiteReturn,
	REMOVE.bracket, REMOVE.tab,
	REMOVE.htmlTag, REMOVE.book,
	REMOVE.squareBracket, REMOVE.backslash,
	REMOVE.letter, REMOVE.number
)

const TOZH = {
	space: [
		{reg: / /g, replacement: "　"},
	],
	comma: [
		{reg: /,/g, replacement: "，"},
		{reg: /\./g, replacement: "。"},
	],
	questionmark: [
		{reg: /\?/g, replacement: "？"},
		{reg: /!/g, replacement: "！"},
	],
	colon: [
		{reg: /;/g, replacement: "；"},
		{reg: /:/g, replacement: "："},
	],
	bracket: [
		{reg: /\(/g, replacement: "（"},
		{reg: /\)/g, replacement: "）"},
	],
	squareBracket: [
		{reg: /\[/g, replacement: "【"},
		{reg: /\]/g, replacement: "】"},
	],
	quot: [
		{reg: /"(.*?)"/g, replacement: "“$1”"},
		{reg: /'(.*?)'/g, replacement: "‘$1’"},
	],
	connector: [
		{reg: /-/g, replacement: "—"},
		{reg: /\.\.\./g, replacement: "…"},
	],
	book: [
		{reg: /\</g, replacement: "《"},
		{reg: /\>/g, replacement: "》"},
	],
	backslash: [
		{reg: /\\/g, replacement: "、"},
	],
	all: []
}

TOZH.all = [].concat(
	TOZH.space, TOZH.comma,
	TOZH.questionmark, TOZH.colon,
	TOZH.bracket, TOZH.quot,
	TOZH.connector,  TOZH.book, TOZH.squareBracket,
	TOZH.backslash
)

const TOEN = {
	space: [
		{reg: /　/g, replacement: " "},
	],
	comma: [
		{reg: /，/g, replacement: ","},
		{reg: /。/g, replacement: "."},
	],
	colon: [
		{reg: /；/g, replacement: ";"},
		{reg: /：/g, replacement: ":"},
	],
	quot: [
		{reg: /[“”]/g, replacement: "\""},
		{reg: /[‘’]/g, replacement: "\'"},
	],
	questionmark: [
		{reg: /？/g, replacement: "?"},
		{reg: /！/g, replacement: "!"},
	],
	bracket: [
		{reg: /（/g, replacement: "("},
		{reg: /）/g, replacement: ")"},
	],
	squareBracket: [
		{reg: /【/g, replacement: "["},
		{reg: /】/g, replacement: "]"},
	],
	connector: [
		{reg: /[－—–]/g, replacement: "-"},
		{reg: /…/g, replacement: "..."},
	],
	book: [
		{reg: /《/g, replacement: "<"},
		{reg: /》/g, replacement: ">"},
	],
	backslash: [
		{reg: /、/g, replacement: "\\"},
	],
	all: []
}
TOEN.all = [].concat(
	TOEN.space, TOEN.comma,
	TOEN.questionmark, TOEN.colon,
	TOEN.bracket, TOEN.quot,
	TOEN.connector, TOEN.book, TOEN.squareBracket,
	TOEN.backslash
)

// 中英文/数字之间加空格（盘古 pangu 方案：仅 CJK 与英数字边界）
function formatAlnumSpace() {
	const CJK = '\u2E80-\u9FFF\uF900-\uFAFF\uFE30-\uFE4F';
	const ALNUM = 'A-Za-z0-9\uFF10-\uFF19\uFF21-\uFF3A\uFF41-\uFF5A';
	let text = textarea.value;
	text = text.replace(new RegExp('([' + CJK + '])([' + ALNUM + '])', 'g'), '$1 $2');
	text = text.replace(new RegExp('([' + ALNUM + '])([' + CJK + '])', 'g'), '$1 $2');
	text = text.replace(/ {2,}/g, ' ');
	textarea.value = text;
	clearTimeout(inputTimer);
	pushHistory(textarea.value);
	updateInfos();
}

const MATCH = {
	symbolEn: /[,.:;'"!\?\[\]#@%\^\$\(\)\*\-\=\+\_\<\>\/\\{}`~]/g,
	symbolCn: /[，。：；”…“《》、？【】『』、（）￥！・—]/g,
	characterEn: /[a-zA-Z]/g,
	space: /[ 　]/g,
	tab: /\t/g,
	quot: /['"”“]/g,
	comma: /[，。,\.]/g,
}

const STORAGE_KEY = 'words_editor_state';
const MAX_HISTORY = 50;
const HISTORY_DEBOUNCE = 400;

let textarea;
let history = [''];
let historyIndex = 0;
let historyPaused = false;
let inputTimer = null;

window.onload = function () {
	textarea = $('#text');
	initHistory();
	textarea.addEventListener('input', handleInput);
	textarea.addEventListener('keydown', handleEditorKeydown);
	textarea.addEventListener('select', updateSelectionInfo);
	textarea.addEventListener('keyup', updateSelectionInfo);
	textarea.addEventListener('mouseup', updateSelectionInfo);
	textarea.addEventListener('click', updateSelectionInfo);
	updateInfos();
	updateHistoryButtons();
}

// 从 localStorage 恢复历史
function initHistory() {
	const loaded = loadState();
	if (loaded) {
		textarea.value = history[historyIndex];
		return;
	}
	history = [textarea.value || ''];
	historyIndex = 0;
	saveState();
}

function loadState() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) {
			return false;
		}
		const data = JSON.parse(raw);
		if (!Array.isArray(data.history) || !data.history.length) {
			return false;
		}
		history = data.history.slice(-MAX_HISTORY);
		historyIndex = Math.min(
			typeof data.index === 'number' ? data.index : history.length - 1,
			history.length - 1
		);
		if (historyIndex < 0) {
			historyIndex = 0;
		}
		return true;
	} catch (e) {
		return false;
	}
}

function saveState() {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify({
			history: history.slice(-MAX_HISTORY),
			index: historyIndex,
		}));
	} catch (e) {
		// 超出容量时裁剪最早记录
		if (history.length > 10) {
			history = history.slice(-10);
			historyIndex = Math.min(historyIndex, history.length - 1);
			try {
				localStorage.setItem(STORAGE_KEY, JSON.stringify({
					history: history,
					index: historyIndex,
				}));
			} catch (err) {}
		}
	}
}

// 记录一次修改
function pushHistory(value) {
	if (historyPaused) {
		return;
	}
	if (history[historyIndex] === value) {
		return;
	}
	history = history.slice(0, historyIndex + 1);
	history.push(value);
	if (history.length > MAX_HISTORY) {
		history.shift();
	}
	historyIndex = history.length - 1;
	saveState();
	updateHistoryButtons();
}

function handleInput() {
	updateInfos();
	clearTimeout(inputTimer);
	inputTimer = setTimeout(function () {
		pushHistory(textarea.value);
	}, HISTORY_DEBOUNCE);
}

function undo() {
	if (historyIndex <= 0) {
		return;
	}
	historyIndex--;
	applyHistoryState();
}

function redo() {
	if (historyIndex >= history.length - 1) {
		return;
	}
	historyIndex++;
	applyHistoryState();
}

// 清空输入框与 localStorage 历史
function clearHistory() {
	clearTimeout(inputTimer);
	textarea.value = '';
	history = [''];
	historyIndex = 0;
	try {
		localStorage.removeItem(STORAGE_KEY);
	} catch (e) {}
	updateInfos();
	updateHistoryButtons();
}

function applyHistoryState() {
	historyPaused = true;
	textarea.value = history[historyIndex];
	historyPaused = false;
	saveState();
	updateInfos();
	updateHistoryButtons();
}

function updateHistoryButtons() {
	const undoBtn = $('#btnUndo');
	const redoBtn = $('#btnRedo');
	if (!undoBtn || !redoBtn) {
		return;
	}
	const canUndo = historyIndex > 0;
	const canRedo = historyIndex < history.length - 1;
	undoBtn.classList.toggle('disabled', !canUndo);
	redoBtn.classList.toggle('disabled', !canRedo);
}

// Ctrl + 方向键：行首/行尾、文档首/文档尾；Ctrl+Z/Y 撤销重做
function handleEditorKeydown(e) {
	if (e.ctrlKey || e.metaKey) {
		if (!e.altKey) {
			const key = e.key.toLowerCase();
			if (key === 'z' && !e.shiftKey) {
				e.preventDefault();
				undo();
				return;
			}
			if (key === 'y' || (key === 'z' && e.shiftKey)) {
				e.preventDefault();
				redo();
				return;
			}
		}
		if (!e.altKey && !e.shiftKey) {
			const key = e.key;
			if (key === 'ArrowLeft' || key === 'ArrowRight' || key === 'ArrowUp' || key === 'ArrowDown') {
				e.preventDefault();
				const value = textarea.value;
				const pos = textarea.selectionStart;
				switch (key) {
					case 'ArrowLeft':
						setCaret(getLineStart(value, pos));
						break;
					case 'ArrowRight':
						setCaret(getLineEnd(value, pos));
						break;
					case 'ArrowUp':
						setCaret(0);
						break;
					case 'ArrowDown':
						setCaret(value.length);
						break;
				}
				updateSelectionInfo();
			}
		}
	}
}

// 当前行行首位置
function getLineStart(value, pos) {
	const lastNl = value.lastIndexOf('\n', pos - 1);
	return lastNl === -1 ? 0 : lastNl + 1;
}

// 当前行行尾位置
function getLineEnd(value, pos) {
	const nextNl = value.indexOf('\n', pos);
	return nextNl === -1 ? value.length : nextNl;
}

function setCaret(pos) {
	textarea.selectionStart = pos;
	textarea.selectionEnd = pos;
}

function regReplace (regs) {
	regs.forEach(item => {
		textarea.value = textarea.value.replace(item.reg, item.replacement)
	})
	clearTimeout(inputTimer);
	pushHistory(textarea.value);
	updateInfos()
}

function customReplace () {
	const find = $('#replaceFind').value
	const to = $('#replaceTo').value
	const useRegex = $('#replaceUseRegex').checked
	if (find === '') {
		return
	}
	if (useRegex) {
		let re
		try {
			re = new RegExp(find, 'g')
		} catch (e) {
			alert('正则表达式无效')
			return
		}
		textarea.value = textarea.value.replace(re, to)
	} else {
		textarea.value = textarea.value.split(find).join(to)
	}
	clearTimeout(inputTimer);
	pushHistory(textarea.value);
	updateInfos()
}


function $(selector) {
	return document.querySelector(selector);
}

function updateInfos() {
	let countSymbolChinese = textarea.value.match(MATCH.symbolCn)
	let countSymbolEnglish = textarea.value.match(MATCH.symbolEn)
	let countCharacterEnglish = textarea.value.match(MATCH.characterEn)
	let countSpace = textarea.value.match(MATCH.space)
	let countTab = textarea.value.match(MATCH.tab)
	let countQuot = textarea.value.match(MATCH.quot)
	let countComma = textarea.value.match(MATCH.comma)

	$('#tol').innerText = textarea.value.length
	$('#symbolChinese').innerText = countSymbolChinese ? countSymbolChinese.length : 0
	$('#symbolEnglish').innerText = countSymbolEnglish ? countSymbolEnglish.length : 0
	$('#englishCharacter').innerText = countCharacterEnglish ? countCharacterEnglish.length : 0
	$('#tab').innerText = countTab ? countTab.length : 0
	$('#space').innerText = countSpace ? countSpace.length : 0
	$('#symbolQuot').innerText = countQuot ? countQuot.length : 0
	$('#symbolComma').innerText = countComma ? countComma.length : 0
	updateSelectionInfo()
}

// 更新已选字数
function updateSelectionInfo() {
	if (!textarea) {
		return;
	}
	const start = textarea.selectionStart;
	const end = textarea.selectionEnd;
	$('#selectedCount').innerText = start !== end ? end - start : 0;
}




