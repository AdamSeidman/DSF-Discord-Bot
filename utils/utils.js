const cloneDeep = require('lodash/cloneDeep')
const emojiDictionary = require('emoji-dictionary')

module.exports = {
    copyObject: cloneDeep,
    isStringTerminated: (phrase) => typeof phrase === 'string' && phrase.trim().length && ['.', '!', '?', ')', ']'].includes(phrase.trim().slice(-1)),
    randomNumber: (min=1, max=99) => Math.floor(Math.random() * (max - min + 1)) + min,
    randomArrayItem: (arr) => (Array.isArray(arr) && arr[Math.floor(Math.random() * arr.length)]) || arr,
    probabilityCheck: (probability) => Math.random() <= (probability || 0.5),
    stripPunctuation: (str) => (typeof str === 'string' && str.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '').replace(/\s{2,}/g, ' ')) || str,
    removeSpaces: (str) => (typeof str === 'string' && str.replace(/\s+/g, '')) || str,
    cleanUpSpaces: (str) => (typeof str === 'string' && str.replace(/\s+/g, ' ').trim()) || str,
    matchesDiscordId: (str) => (str || '').match(/^<@\d{18}>$/)? str.match(/\d{18}/)[0] : null,
    randomEmojis: (n=1) => Array.from({length: n}, () => emojiDictionary.unicode[Math.floor(Math.random() * emojiDictionary.unicode.length)]),
    shuffleArray: function (array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array
    }
}
