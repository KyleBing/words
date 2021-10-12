
var REMOVE = {
	space: 			[{reg: /( |　)/g, replacement: ""},],
	return: 		[{reg: /\n/g, replacement: ""},],
	tab: 				[{reg: /\t/g, replacement: ""},],
	quot: 			[{reg: /[“”"']/g, replacement: ""},] ,
	whiteReturn: [{reg: /(^\s*?(\n|\r\n|\r))+/g, replacement: ""},],
	bracket:		[{reg: /(\(|\)|（|）)/g, replacement: ""},],
	htmlTag:		[{reg: /<.+?>|<\/.+?>/g, replacement: ""},],
	all: []
}

REMOVE.all = [].concat(
	REMOVE.space, REMOVE.return,
	REMOVE.quot, REMOVE.whiteReturn,
	REMOVE.bracket, REMOVE.tab,
	REMOVE.htmlTag
)


var TOZH = {
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
	quot: [
		{reg: /"(.*?)"/g, replacement: "“$1”"},
		{reg: /'(.*?)'/g, replacement: "‘$1’"},
	],
	connector: [
		{reg: /-/g, replacement: "—"},
		{reg: /\.\.\./g, replacement: "…"},
	],
	all: []
}

TOZH.all = [].concat(
	TOZH.space, TOZH.comma,
	TOZH.questionmark, TOZH.colon,
	TOZH.bracket, TOZH.quot,
	TOZH.connector
)

var TOEN = {
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
	connector: [
		{reg: /[－—–]/g, replacement: "-"},
		{reg: /…/g, replacement: "..."},
	],
	all: []
}
TOEN.all = [].concat(
	TOEN.space, TOEN.comma,
	TOEN.questionmark, TOEN.colon,
	TOEN.bracket, TOEN.quot,
	TOEN.connector
)


var MATCH = {
	symbolEn: /[,.:;'"!\?\[\]#@%\^\$\(\)\*\-\=\+\_\<\>\/\\{}`~]/g,
	symbolCn: /[，。：；”…“《》、？【】『』、（）￥！・—]/g,
	characterEn: /[a-zA-Z]/g,
	space: /[ 　]/g,
	tab: /\t/g,
	quot: /['"”“]/g,
	comma: /[，。,\.]/g,
}

var textarea;

window.onload = function () {
	textarea = $('#text');
}




function regReplace (regs) {
	regs.forEach(item => {
		textarea.value = textarea.value.replace(item.reg, item.replacement)
	})
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
}




