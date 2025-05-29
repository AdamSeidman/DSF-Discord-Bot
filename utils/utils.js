const cloneDeep = require('lodash/cloneDeep')

module.exports = {
    copyObject: cloneDeep,
    isStringTerminated: (phrase) => typeof phrase === 'string' && phrase.trim().length && ['.', '!', '?', ')', ']'].includes(phrase.trim().slice(-1)),
    randomNumber: (max) => Math.ceil(Math.random() * (max || 98)) + 1,
    randomArrayItem: (arr) => (Array.isArray(arr) && arr[Math.floor(Math.random() * arr.length)]) || arr,
    probabilityCheck: (probability) => Math.random() <= (probability || 0.5),
    stripPunctuation: (str) => (typeof str === 'string' && str.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '').replace(/\s{2,}/g, ' ')) || str,
    removeSpaces: (str) => (typeof str === 'string' && str.replace(/\s+/g, '')) || str,
    cleanUpSpaces: (str) => (typeof str === 'string' && str.replace(/\s+/g, ' ').trim()) || str,
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
