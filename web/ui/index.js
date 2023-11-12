/**
 * Author: Adam Seidman
 * 
 * Provides functionality to html elements
 */

// eslint does not like non-npm .js files
/* eslint-disable */

var sendRefresh = function () {
    post('refresh')
}

var personData = {
    gender: {
        value: 1,
        elements: document.getElementsByClassName('genderBtn'),
        element: 'gender-toggle-text'
    },
    isAlive: {
        value: 1,
        elements: document.getElementsByClassName('lifeBtn'),
        element: 'alive-toggle-text'
    }
}

var isItemSentient = 1
var overrideMessage = ''
var lastSubmittedMessage = ''

// Update override message
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

// Submit override message to server
var submitOverrideMessage = function () {
    const isActive = document.getElementById('active-toggle').checked
    if (!isActive) {
        post(`override-message/${overrideMessage}`)
        lastSubmittedMessage = overrideMessage
    }
}

// Update online toggle switch
var setToggle = function (isActive) {
    if (isActive === undefined) {
        isActive = document.getElementById('active-toggle').checked
    } else {
        document.getElementById('active-toggle').checked = isActive
    }
    document.getElementById('toggle-text').innerHTML = isActive ? 'online' : 'offline'
    post(`bot-online${isActive ? '' : '/a'}`)
    if (!isActive && overrideMessage !== lastSubmittedMessage) {
        submitOverrideMessage()
    }
}

// Log person properties
var togglePersonProperty = function (isGender) {
    let prop = isGender ? 'gender' : 'isAlive'
    let value = (personData[prop].value + 1) % 2
    personData[prop].value = value
    personData[prop].elements[personData[prop].value].classList.remove('active')
    personData[prop].elements[(personData[prop].value + 1) % 2].classList.add('active')
    personData[prop].elements[personData[prop].value].disabled = false
    personData[prop].elements[(personData[prop].value + 1) % 2].disabled = true
}

// Log item sentience
var toggleItemSentience = function () {
    isItemSentient = (isItemSentient + 1) % 2
    let els = document.getElementsByClassName('itemBtn')
    els[isItemSentient].classList.remove('active')
    els[isItemSentient].disabled = false
    els[(isItemSentient + 1) % 2].classList.add('active')
    els[(isItemSentient + 1) % 2].disabled = true
}

// Submit http request to add person to .db
var submitPerson = function () {
    var { nameInput, name, error } = getInput('name', undefined, true)
    if (error) return
    post(`person/${name}_${personData.gender.value}_${personData.isAlive.value}`)
    nameInput.value = ''
}

// Submit http request to add place to .db
var submitPlace = function () {
    var { placeInput, place, error } = getInput('place', 'place name')
    if (error) return
    post(`place/${place}`)
    placeInput.value = ''
}

var submitImmediateMsg = async function () {
    let immMessageInput = await document.getElementById('immMessageInput');
    let message = immMessageInput.value.trim()
    if (message.length === 0) return
    let channelId = await document.getElementById('channelInput').value.trim()
    if (channelId === 0) return
    post(`immediate-message/${channelId}_${message}`)
    immMessageInput.value = ''
}

// Submit http request to add item to .db
var submitItem = function () {
    var { itemInput, item, error } = getInput('item', 'item name')
    if (error) return
    var { pluralInput, plural, error } = getInput('plural', 'plural name')
    if (error) return
    var { usageInput, usage, error } = getInput('usage', 'usage text')
    if (error) return
    post(`item/${item.toLowerCase().trim()}_${plural.toLowerCase().trim()}_${isItemSentient}_${usage.toLowerCase().trim()}`)
    itemInput.value = ''
    pluralInput.value = ''
    usageInput.value = ''
    document.getElementById('usage-string').innerHTML = ''
}

// Submit http request to add fact template to .db
var submitFact = function () {
    var { factInput, fact, error } = getInput('fact')
    if (error) return
    let checkbox = document.getElementById('recurse-checkbox')
    post(`fact/${fact}_${checkbox.checked ? 1 : 0}`)
    factInput.value = ''
    checkbox.checked = true
}

// Submit http request to add static fact to .db
var submitStaticFact = function () {
    var { staticFactInput, staticFact, error } = getInput('staticFact')
    if (error) return
    post(`static-fact/${staticFact}`)
    staticFactInput.value = ''
}

// Change item usage of logged item
var updateUsage = function () {
    document.getElementById('usage-string').innerHTML = 
        `${document.getElementById('usageInput').value.trim()} ${document.getElementById('itemInput').value.trim()}`
}

// Submit http request for new fact-blurb adjective
var submitAdjective = function () {
    var { adjectiveInput, adjective, error } = getInput('adjective')
    if (error) return
    post(`adjective/${adjective.trim().toLowerCase()}`)
    adjectiveInput.value = ''
}

// Get input and alert
var getInput = function (inputName, alertName, isPerson) {
    if (alertName === undefined) {
        alertName = inputName
    }
    let data = { error: false }
    let elID = inputName + 'Input'
    data[elID] = document.getElementById(elID)
    data[inputName] = data[elID].value.trim()
    if (inputName.toLowerCase().includes('fact')) {
        if (data[inputName].length === 0) {
            alert(`Provided ${alertName} is invalid.`)
            data.error = true
        }
    } else if (data[inputName].length === 0 || 
        data[inputName].includes('_') || 
        data[inputName].includes('\'') || 
        data[inputName].includes('\\')) {

        alert(`Provided ${alertName} is invalid.`)
        data.error = true
    } else if (dbData[isPerson ? 'people' : 'items'].includes(data[inputName].toLowerCase())) {
        alert(`Provided ${alertName} is too similar to a pre-exising ${alertName}.`)
        data.error = true
    }
    return data
}

// Send actual http request through axios
var axiosCommand = function (path, method) {
    console.log(`${method.toUpperCase()}: \\${path}`)
    return axios({
        method: method,
        url: window.location.href + path
    })
}

var post = path => axiosCommand(path, 'post')

var get = path => { return axiosCommand(path, 'get') }

var dbData = undefined
get('data').then(response => {
    console.log(response)
    dbData = response.data
})

// Set look
var setupPage = function () {
    let bodyEl = document.getElementById('dsf-container')
    bodyEl.classList.add((screen.width > screen.height) ? 'landscape' : 'portrait')
}

// POST commands to run .bat files from /scripts
var sendRestartCommand = function () {
    post('restart-app')
}
