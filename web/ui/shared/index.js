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
    let prop = isGender ? 'gender' : 'isAlive'
    let value = (personData[prop].value + 1) % 2
    personData[prop].value = value
    if (isRemote) {
        document.getElementById(personData[prop].element).innerHTML = 
            (isGender ? (value === 1 ? 'male': 'female') : 
                (value === 1 ? 'yes' : 'no'))
    } else {
        personData[prop].elements[personData[prop].value].classList.remove('active')
        personData[prop].elements[(personData[prop].value + 1) % 2].classList.add('active')
        personData[prop].elements[personData[prop].value].disabled = false
        personData[prop].elements[(personData[prop].value + 1) % 2].disabled = true
    }
}

var toggleItemSentience = function () {
    isItemSentient = (isItemSentient + 1) % 2
    if (isRemote) {
        document.getElementById('animal-toggle-text').innerHTML = 
            (isItemSentient === 1 ? 'yes' : 'no')
    } else {
        let els = document.getElementsByClassName('itemBtn')
        els[isItemSentient].classList.remove('active')
        els[isItemSentient].disabled = false
        els[(isItemSentient + 1) % 2].classList.add('active')
        els[(isItemSentient + 1) % 2].disabled = true
    }
}

var submitPerson = function () {
    var { nameInput, name, error } = getInput('name', undefined, true)
    if (error) return
    var { nicknameInput, nickname, error } = getInput('nickname', undefined, true)
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
    post(`item/${item.toLowerCase().trim()}_${plural.toLowerCase().trim()}_${isItemSentient}_${usage.toLowerCase().trim()}`)
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
    post(`adjective/${adjective.trim().toLowerCase()}`)
    adjectiveInput.value = ''
}

var getInput = function (inputName, alertName, isPerson) {
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
    } else if (dbData[isPerson ? 'people' : 'items'].includes(data[inputName].toLowerCase())) {
        alert(`Provided ${alertName} is too similar to a pre-exising ${alertName}.`)
        data.error = true
    }
    return data
}

var axiosCommand = function (path, method) {
    return axios({
        method: method,
        url: url + path
    })
}

var post = path => axiosCommand(path, 'post')

var get = path => { return axiosCommand(path, 'get') }

var dbData = undefined
get('data').then(response => {
    dbData = response.data
})

var setupPage = function () {
    let bodyEl = document.getElementById('dsf-container')
    bodyEl.classList.add((screen.width > screen.height) ? 'landscape' : 'portrait')
}

var sendDbCommand = function () {
    post('open-external-db')
}

var sendRestartCommand = function () {
    post('restart-app')
}