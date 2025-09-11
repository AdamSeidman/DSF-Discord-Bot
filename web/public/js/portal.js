let allPlaces = [], allItems = [], allPeople = [], allTags = []
const CACHED_LIST_KEY = 'cachedListInfo'

function openTab(evt, tabName) {
    $('.tab-content').hide()
    $('.tab-button').removeClass('active')
    $(`#${$.escapeSelector(tabName)}`).show()
    $(evt.currentTarget).addClass('active')

    let params = new URLSearchParams(window.location.search)
    params.set('tab', tabName)
    history.replaceState(null, '', '?' + params.toString())
}

$(() => {
    let params = new URLSearchParams(window.location.search)
    const validTabs = ['UserTab', 'ItemTab', 'PersonTab', 'Kill Tab', 'PlaceTab', 'StaticTab', 'FactTab',
        'AdminTab','DMsTab', 'InsultTab', 'HolidayTab']
    let tabName = validTabs.includes(params.get('tab')) ? params.get('tab') : validTabs[0];
    openTab({ currentTarget: `#tab-${tabName}` }, tabName)
    standardGET('portalData')
        .then(({ user, fact, places, items, people, tags, isOverriden, overrideMsg }) => {
            if (!user) {
                throw new Error('No data returned!')
            }
            allPlaces = (places || []).map(x => x.name)
            allItems = (items || []).map(x => x.name)
            allPeople = (people || []).map(x => x.name)
            allTags = (tags || [])
            allTags.sort()
            const killSelect = $('select#killPersonName')
            killSelect.html(killSelect.html() + people.sort((a, b) => a.name.localeCompare(b.name)).reduce(
                (out, person) => `${out}${person.is_alive? `<option value="${person.name}">${person.name}</option>` : ''}`, ''))
            $('#welcome-text').text(`Welcome, ${user.username}!\n`)
            $('.fill-username').text(user.username.slice(0, 1).toUpperCase() + user.username.slice(1))
            $('#fact-text').text(`Fun fact:\n${fact}\n`)
            $('#stats-text').text(`You have requested ${
                pluralize('fact', 's', user.stats.fact)}, ${
                pluralize('lie', 's', user.stats.lie)}, ${
                pluralize('prius', 'es', user.stats.prius)}, ${
                pluralize('acronym', 's', user.stats.acronym)}, ${
                pluralize('effect', 's', user.stats.effect)}, and ${
                pluralize('meme', 's', user.stats.meme)}!\n`)
            $('.requires-owner').toggleClass('hidden', !user.is_owner)
            const permsTabMap = {
                Item: 'submit_new_items',
                Person: 'submit_new_people',
                Kill: 'submit_new_people',
                Place: 'submit_new_places',
                Tags: 'submit_new_tags',
                Static: 'submit_static_facts',
                Fact: 'submit_new_templates',
                Admin: 'is_owner',
                DMs: 'is_owner',
                Insult: 'submit_insults',
                Holiday: 'submit_holidays'
            }
            Object.entries(permsTabMap).forEach(([ tabName, perm ]) => {
                if (user[perm]) {
                    $(`#tab-${tabName}Tab`).removeClass('hidden')
                }
            })
            $('select#pickedTag').html(allTags.map(x => 
                `<option value="${x}">${x.charAt(0).toUpperCase()}${x.slice(1)}</option>`
            ).join(''))
            if (user.is_owner) {
                $('#overrideMessage').val(overrideMsg)
                $('#override-cb').attr('checked', isOverriden)
            }
            const itemCache = JSON.parse(localStorage.getItem(CACHED_LIST_KEY) || '{}')
            if (itemCache.date && (Date.now() - new Date(itemCache.date).getTime()) >= (2 * 60 * 60 * 1000)) {
                localStorage.removeItem(CACHED_LIST_KEY)
            }
        })
        .catch((error) => {
            console.error(error)
            alert('Could not load page!')
        })
})

function immMsgValidator() {
    let valid = $('#immChannelId').val().trim().length >= 17
    valid &&= ($('#immMessage').val().trim().length > 0)
    $('button#send-imm-btn').attr('disabled', !valid)
}

function sendImmediateMessage() {
    const message = $('#immMessage').val().trim()
    const id = $('#immChannelId').val().trim()
    standardPUT('immediateMessage', { message, id })
        .then(() => {
            $('#immMessage').val('')
        })
        .catch((error) => {
            console.error('Could not send immediate message!', error)
            alert('Could not send message!')
            $('#immMessage').val('')
            $('#immChannelId').val('')
        })
}

function sendRestart() {
    standardPOST('restart')
        .then(() => alert('Restart command sent.'))
        .catch((error) => {
            console.error('Error with restart!', error)
            alert('Error!')
        })
}

function sendRefresh() {
    standardPUT('refresh')
        .then(() => alert('Refresh command sent.'))
        .catch((error) => {
            console.error('Error with refresh', error)
            alert('Error!')
        })
}

let overrideTimeoutId = -1

async function validateOverrideChange(el) {
    if (overrideTimeoutId >= 0) {
        clearTimeout(overrideTimeoutId)
        overrideTimeoutId = -1
    }
    let message = $('#overrideMessage').val().trim()
    if (!el.checked || message.length <= 0) {
        message = null
    }
    try {
        await standardPUT('overrideMessage', { message })
    } catch (error) {
        console.error('Error setting override message.', error)
    }
}

function setOverrideTimeout() {
    if (overrideTimeoutId >= 0) {
        clearTimeout(overrideTimeoutId)
    }
    if ($('#override-cb').is(':checked')) {
        overrideTimeoutId = setTimeout(overrideTimeoutCb, 1000)
    } else {
        overrideTimeoutId = -1
    }
}

async function overrideTimeoutCb() {
    overrideTimeoutId = -1
    let message = $('#overrideMessage').val().trim()
    if (message.length <= 0) {
        message = null
        $('#override-cb').attr('checked', false)
    }
    try {
        await standardPUT('overrideMessage', { message })
    } catch (error) {
        console.error('Error setting override message.', error)
    }
}

function removeAll(word, characters) {
    [...characters].forEach((c) => {
        word = word.split(c).join('')
    })
    return word
}

function confirmSubmission(word, list) {
    if (list.includes(word)) {
        alert('Exact match found in existing database!')
        return false
    }
    word = removeAll(word, ',. ').toLowerCase()
    const originMap = {}
    let items = list.map((item) => {
        const modded = removeAll(item, ',. ').toLowerCase()
        originMap[modded] = item
        return modded
    }).filter(x => (x.includes(word) || word.includes(x)))
    if (items.length < 1) {
        return true
    } else if (items.length > 10) {
        alert('Found too many possible matches!')
        return false
    }
    return confirm(`Found possible matches below.\nConfirm submission?\n\n-${
        items.map(x => (originMap[x] || x)).join('\n-')}`)
}

function submit(key, list, mainInput, additional={}, clearList=[], cb) {
    $(`button#${key}-submit-btn`).attr('disabled', true)
    let name = $(`#${mainInput}`).val().trim()
    const cachedItems = JSON.parse(localStorage.getItem(CACHED_LIST_KEY)
        || JSON.stringify({ list: [] })).list
    if (confirmSubmission(name, (list.length > 0)? [...list, ...cachedItems] : [])) {
        standardPOST(key, { submission: { name, ...additional } })
            .then(() => {
                $(`#${mainInput}`).val('')
                clearList.forEach((id) => {
                    $(`#${id}`).val('')
                    $(`span.${id}`).text('')
                })
                if (list.length > 0) {
                    localStorage.setItem(CACHED_LIST_KEY, JSON.stringify({
                        list: [...cachedItems, name],
                        date: Date.now()
                    }))
                }
                if (typeof cb === 'function') {
                    cb()
                }
            })
            .catch((error) => {
                console.error(`Could not submit ${key}.`, error)
                alert('Could not submit!')
                $(`button#${key}-submit-btn`).attr('disabled', false)
            })
    } else {
        $(`button#${key}-submit-btn`).attr('disabled', false)
    }
}

function itemTabValidator() {
    let valid = $('#singleItem').val().trim().length > 0
    valid &&= ($('#itemUsage').val().trim().length > 0)
    valid &&= ($('#multipleItems').val().trim().length > 0)
    $('#usage-example-text').text($('#itemUsage').val().trim())
    $('#item-example-text').text($('#singleItem').val().trim())
    $('#plural-example-text').text($('#multipleItems').val().trim())
    $('button#item-submit-btn').attr('disabled', !valid)
}

function submitItem() {
    submit('item', allItems, 'singleItem', {
        usage: $('#itemUsage').val().trim(),
        plural: $('#multipleItems').val().trim(),
        is_food: $('#item-food-cb').is(':checked'),
        is_alive: $('#item-alive-cb').is(':checked')
    }, ['itemUsage', 'multipleItems', 'item-preview-text'])
}

function insultValidator() {
    const input = $('#insultInput').val()?.trim() || ''
    $('#insult-example-text').text(input)
    $('button#insult-submit-btn').attr('disabled', input.length < 1 || input.split(' ').length < 2)
}

function submitInsult() {
    submit('insult', [], 'insultInput', {}, ['insultExample'])
}

function personValidator() {
    $('button#person-submit-btn').attr('disabled', $('#personName').val().trim().length <= 0)
}

function submitPerson() {
    submit('person', allPeople, 'personName', {
        is_male: $('#person-male-cb').is(':checked'),
        is_alive: $('#person-alive-cb').is(':checked')
    })
}

function deadPersonValidator() {
    let disabled = true
    try {
        let name = $('select#killPersonName').find(':selected').val()
        if (name.trim()?.length > 1) disabled = false
    } catch {}
    $('#kill-submit-btn').attr('disabled', disabled)
}

function murderPerson() {
    $('#kill-submit-btn').attr('disabled', true)
    const body = {
        name: $('select#killPersonName').find(':selected')?.val()
    }
    standardPUT('kill', body)
        .then(() => location.reload())
        .catch((error) => {
            console.error('Could not murder', body, error)
            alert('Could not submit kill request!')
            setTimeout(() => location.reload(), 5000)
        })
}

function placeValidator() {
    $('button#place-submit-btn').attr('disabled', $('#placeName').val().trim().length <= 0)
}

function submitPlace() {
    submit('place', allPlaces, 'placeName')
}

function templateValidator() {
    const template = $('#factTemplate').val().trim()
    let valid = template.length >= 0
    if (valid) {
        try {
            JSON.parse(template)
        } catch {
            valid = false
        }
    }
    $('button#template-submit-btn').attr('disabled', !valid)
}

function submitFactTemplate() {
    submit('template', [], 'factTemplate', {
        can_recurse: $('#fact-recurse-cb').is(':checked')
    }, [], () => {
        $(`#fact-recurse-cb`).attr('checked', true)
        alert('Submitted!')
    })
}

function staticFactValidator() {
    $('button#staticFact-submit-btn').attr('disabled', $('#staticFactInput').val().trim().length <= 0)
}

function submitStaticFact() {
    submit('staticFact', [], 'staticFactInput')
}

const LONG_MONTHS = Object.freeze([1, 3, 5, 7, 8, 10, 12]);
function holidayValidator() {
    try {
        let month = parseInt($('#holidayMonth').find(':selected').val())
        if (month < 1 || month > 12 || isNaN(month)) {
            throw null
        }
        let day = parseInt($('#holidayDay').find(':selected').val())
        if (day < 1 || day > 31 || isNaN(day)) {
            throw null
        }
        if (day > 29 && month === 2) {
            throw null
        }
        if (day === 30 && !(LONG_MONTHS.includes(month))) {
            throw null
        }
        let title = $('#holidayNameInput').val().trim()
        if (typeof title !== 'string' || title.length < 1) {
            throw null
        }
        $('#holiday-submit-btn').attr('disabled', false)
        return { month, day, title, valid: true }
    } catch {
        $('#holiday-submit-btn').attr('disabled', true)
    }
    return { valid: false }
}

function submitHoliday() {
    try {
        const { valid, month, day } = holidayValidator()
        if (!valid) {
            $('#holiday-submit-btn').attr('disabled', true)
            console.error('Bad holiday input.', month, day)
            alert('Could not parse input to submit holiday!')
            return
        }
        submit('holiday', [], 'holidayNameInput', { month, day }, ['HolidayTab select'])
    } catch (error) {
        console.error('Error submitting holiday', error)
    }
}

function refreshDMs() {
    standardGET('directMessages')
        .then(({ data }) => {
            if (!Array.isArray(data?.messages)) {
                throw new Error('No messages array.')
            } else {
                console.log(data)
            }
            const users = []
            const messages = []
            data.messages.forEach((message) => {
                if (message.includes('): ')) {
                    users.push(`${message.slice(0, message.indexOf('(u:')).trim()} (${message.slice(message.indexOf('(u:') + 3, message.indexOf(' ch:')).trim()})`)
                    messages.push(`${message.slice(0, message.indexOf(' (u:'))}: ${message.slice(message.indexOf('): ') + 2).trim()}`)
                } else {
                    messages.push(message)
                }
            })
            let html = '<hr>' + messages.join('<br><br>')
            if (users.length > 0) {
                html = `<h4>Users:</h4>${([...new Set(users)]).join('<br>')}<br>&nbsp;<hr><h4>Messages:</h4>${
                    messages.map(x => x.trim().replaceAll('\n', '<br>')).join('<br><br>')}<br>&nbsp;`
            }
            $('div#dms-container').html(html)
        })
        .catch((error) => {
            console.error('Error fetching DMs', error)
            alert('Error: ' + error)
        })
}

function fetchSpecificMessages() {
    let id = $('input#channelIdInput').val()
    console.log(id)
    standardGET('directMessages', `id=${id}`)
        .then(({ data }) => {
            if (!Array.isArray(data?.messages)) {
                throw new Error('No messages array.')
            }
            $('div#dms-container').html(`<h4>Messages:</h4><div>${data.messages.map(x => x.trim().replaceAll('\n', '<br>')).join('<br><br>')}</div>`)
        })
        .catch((error) => {
            console.error('Error fetching specific DMs', error)
            alert('Error: ' + error)
        })
}
