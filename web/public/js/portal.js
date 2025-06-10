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
            $('#welcome-text').text(`Welcome, ${user.username}!\n\nDid you know:\n${fact}`)
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
