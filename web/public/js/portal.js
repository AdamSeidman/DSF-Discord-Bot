let allPlaces = [], allItems = [], allPeople = [], allTags = []

function openTab(evt, tabName) {
    $('.tab-content').hide()
    $('.tab-button').removeClass('active')
    $(`#${tabName}`).show()
    $(evt.currentTarget).addClass('active')

    let params = new URLSearchParams(window.location.search)
    params.set('tab', tabName)
    history.replaceState(null, '', '?' + params.toString())
}

const permsTabMap = {
    submit_new_items: 'Item',
    submit_new_people: 'Person',
    submit_new_places: 'Place',
    submit_new_tags: 'Tags',
    submit_static_facts: 'Static',
    submit_new_templates: 'Fact',
    is_owner: 'Admin'
}

$(document).ready(() => {
    let params = new URLSearchParams(window.location.search)
    let tabName = params.get('tab') || 'UserTab'
    openTab({ currentTarget: `#tab-${tabName}` }, tabName)
    standardGET('portalData')
        .then(({ user, fact, places, items, people, tags, isOverriden, overrideMsg }) => {
            if (!user) {
                throw new Error('No data returned!')
            }
            allPlaces = places || []
            allItems = items || []
            allPeople = people || []
            allTags = tags || []
            allTags.sort()
            $('#welcome-text').text(`Welcome, ${user.username}!\n`)
            $('#fact-text').text(`Fun fact:\n${fact}\n`)
            $('#stats-text').text(`You have requested ${
                pluralize('fact', 's', user.stats.fact)}, ${
                pluralize('lie', 's', user.stats.lie)}, ${
                pluralize('prius', 'es', user.stats.prius)}, ${
                pluralize('acronym', 's', user.stats.acronym)}, and ${
                pluralize('effect', 's', user.stats.effect)}!\n`)
            $('.requires-owner').toggleClass('hidden', !user.is_owner)
            Object.entries(permsTabMap).forEach(([ perm, tabName ]) => {
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
        })
        .catch((error) => {
            console.error(error)
            alert('Could not load page!')
        })
})

function immMsgValidator() {
    let valid = $('#immChannelId').val().trim().length === 18
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
    alert(1) // TODO
}

function personValidator() {
    $('button#person-submit-btn').attr('disabled', $('#personName').val().trim().length <= 0)
}

function submitPerson() {
    alert(1) // TODO
}

function placeValidator() {
    $('button#place-submit-btn').attr('disabled', $('#placeName').val().trim().length <= 0)
}

function submitPlace() {
    alert(1) // TODO
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
    alert(1) // TODO
}

function staticFactValidator() {
    $('button#static-submit-btn').attr('disabled', $('#staticFactInput').val().trim().length <= 0)
}

function submitStaticFact() {
    alert(1) // TODO
}

function tagAddonValidator() {
    let valid = $('select#pickedTag').val().length > 0
    valid &&= ($('#tagInput').val().trim().length > 0)
    $('button#addon-tags-submit-btn').attr('disabled', !valid)
}

function submitTagItem() {
    alert(1) // TODO
}
