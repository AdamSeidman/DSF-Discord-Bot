function openTab(evt, tabName) {
    $('.tab-content').hide()
    $('.tab-button').removeClass('active')
    $(`#${tabName}`).show()
    $(evt.currentTarget).addClass('active')

    let params = new URLSearchParams(window.location.search)
    params.set('tab', tabName)
    history.replaceState(null, '', '?' + params.toString())
}

const unhideTabMap = {
    submit_new_items: 'Item',
    submit_new_people: 'Person',
    submit_new_places: 'Place',
    submit_new_tags: 'Tags',
    submit_static_facts: 'Static',
    is_owner: 'Admin'
}

$(document).ready(() => {
    let params = new URLSearchParams(window.location.search)
    let tabName = params.get('tab') || 'UserTab'
    openTab({ currentTarget: `#tab-${tabName}` }, tabName)
    standardGET('perms')
        .then(({ data }) => {
            if (!data) {
                throw new Error('No data returned!')
            }
            $('#welcome-text').text(`Welcome, ${data.username}!`)
            Object.entries(unhideTabMap).forEach(([ key, tabName ]) => {
                if (data[key]) {
                    $(`#tab-${tabName}Tab`).removeClass('hidden')
                } else {
                }
            })
        })
        .catch((error) => {
            console.error(error)
            alert('Could not load page!')
        })
})
