/* eslint-disable */

const url = 'http://localhost:8081/'
const DEBUG = false

/*
var sendRefresh = function () {
    post('refresh')
}*/
var sendRefresh = function () {
    get('refresh').then(response => {
        console.log('got: ')
        console.log(response.data)
    })
}

var personData = {
    gender: {
        value: 1,
        elements: document.getElementsByClassName('genderBtn')
    },
    isAlive: {
        value: 1,
        elements: document.getElementsByClassName('lifeBtn')
    }
}

var isItemSentient = 1
var overrideMessage = ''
var lastSubmittedMessage = ''

var messageUpdate = async function () {
    let message = await document.getElementById('overrideInput').value.trim()
    if (message.length === 0) return
    overrideMessage = message
    setTimeout(() => {
        if (overrideMessage === message) {
            submitOverrideMessage()
        }
    }, 500)
}

var submitOverrideMessage = function () {
    const isActive = document.getElementById('active-toggle').checked
    if (!isActive) {
        post(`override-message/${overrideMessage}`)
        lastSubmittedMessage = overrideMessage
    }
}

var setToggle = function (isActive) {
    if (isActive === undefined) {
        isActive = document.getElementById('active-toggle').checked
    } else {
        document.getElementById('active-toggle').checked = isActive
    }
    document.getElementById('toggle-text').innerHTML = isActive ? 'online' : 'offline'
    post(`bot-online${isActive ? '' : '/a'}`)
    if (!isActive && overrideMessage !== lastSubmittedMessage) {
        console.log()
        submitOverrideMessage()
    }
}

var togglePersonProperty = function (isGender) {
    let prop = isGender ? 'gender' : 'isAlive';
    personData[prop].value = (personData[prop].value + 1) % 2
    personData[prop].elements[personData[prop].value].classList.remove('active')
    personData[prop].elements[(personData[prop].value + 1) % 2].classList.add('active')
    personData[prop].elements[personData[prop].value].disabled = false
    personData[prop].elements[(personData[prop].value + 1) % 2].disabled = true
}

var toggleItemSentience = function () {
    let els = document.getElementsByClassName('itemBtn')
    els[(isItemSentient + 1) % 2].classList.remove('active')
    els[(isItemSentient + 1) % 2].disabled = false
    els[isItemSentient].classList.add('active')
    els[isItemSentient].disabled = true
    isItemSentient = (isItemSentient + 1) % 2
}

var submitPerson = function () {
    var { nameInput, name, error } = getInput('name')
    if (error) return
    var { nicknameInput, nickname, error } = getInput('nickname')
    if (error) return
    post(`person/${name}_${nickname}_${personData.gender.value}_${personData.isAlive.value}`)
    nameInput.value = ''
    nicknameInput.value = ''
}

var submitItem = function () {
    var { itemInput, item, error } = getInput('item', 'item name')
    if (error) return
    var { pluralInput, plural, error } = getInput('plural', 'plural name')
    if (error) return
    var { usageInput, usage, error } = getInput('usage', 'usage text')
    if (error) return
    post(`item/${item}_${plural}_${isItemSentient}_${usage}`)
    itemInput.value = ''
    pluralInput.value = ''
    usageInput.value = ''
    document.getElementById('usage-string').innerHTML = ''
}

var submitFact = function () {
    var { factInput, fact, error } = getInput('fact')
    if (error) return
    let checkbox = document.getElementById('recurse-checkbox')
    post(`fact/${fact}_${checkbox.checked ? 1 : 0}`)
    factInput.value = ''
    checkbox.checked = true
}

var updateUsage = function () {
    document.getElementById('usage-string').innerHTML = 
        `${document.getElementById('usageInput').value.trim()} ${document.getElementById('itemInput').value.trim()}`
}

var submitAdjective = function () {
    var { adjectiveInput, adjective, error } = getInput('adjective')
    if (error) return
    post(`adjective/${adjective}`)
    adjectiveInput.value = ''
}

var getInput = function (inputName, alertName) {
    if (alertName === undefined) {
        alertName = inputName
    }
    let data = { error: false }
    let elID = inputName + 'Input'
    data[elID] = document.getElementById(elID)
    data[inputName] = data[elID].value.trim()
    if (data[inputName].length === 0 || 
        data[inputName].includes('_') || 
        data[inputName].includes('\'') || 
        data[inputName].includes('\\')) {

        alert(`Provided ${alertName} is invalid.`)
        data.error = true
    }
    return data
}

var axiosCommand = function (path, method) {
    if (DEBUG) {
        console.log(`${method.toUpperCase()}: ${path}`)
    } else {
        return axios({
            method: method,
            url: url + path
        })
    }
}

var post = path => axiosCommand(path, 'post')

var get = path => { return axiosCommand(path, 'get') }

var sendDbCommand = function () {
    post('open-external-db')
}

var sendRestartCommand = function () {
    post('restart-app')
}