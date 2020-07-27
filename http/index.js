/* eslint-disable */

const url = 'http://localhost:8081/'
const DEBUG = false

var sendRefresh = function () {
    axios({
        method: 'post',
        url: url + 'refresh',
        data: {}
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
        data[inputName].includes('/')) {

        alert(`Provided ${alertName} is invalid.`)
        data.error = true
    }
    return data
}

var post = async function (path) {
    if (DEBUG) {
        console.log(path)
        return
    }
    axios({
        method: 'post',
        url: url + path,
        data: {}
    })
}