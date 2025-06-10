function openTab(evt, tabName) {
    $('.tab-content').hide()
    $('.tab-button').removeClass('active')
    $(`#${tabName}`).show()
    $(evt.currentTarget).addClass('active')

    let params = new URLSearchParams(window.location.search)
    params.set('tab', tabName)
    history.replaceState(null, '', '?' + params.toString())
}

$(document).ready(() => {
    let params = new URLSearchParams(window.location.search)
    let tabName = params.get('tab') || 'UserTab'
    openTab({ currentTarget: `#tab-${tabName}` }, tabName)
})
