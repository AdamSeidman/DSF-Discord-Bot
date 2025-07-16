const { copyObject } = require("logic-kit")
const { getAll: getExtraHolidays } = require("@tables/holidays")

let holidays = []
const BASE_URL = 'https://date.nager.at/api/v3'

function getDateString() {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const parts = Intl.DateTimeFormat(undefined, {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).formatToParts(new Date())
    return `${parts.find(x => x.type === 'year').value}-${
        parts.find(x => x.type === 'month').value}-${
        parts.find(x => x.type === 'day').value}`
}

async function getCurrentHolidays() {
    const dateString = getDateString()
    if (holidays.length > 0 && holidays[0].date === dateString) {
        return copyObject(holidays)
    }
    holidays = getExtraHolidays()
    const countries = { DSF: 'Global' }
    return await fetch(`${BASE_URL}/AvailableCountries`)
        .then(x => x.json())
        .then((data) => {
            return Promise.allSettled(data.map(({ countryCode, name }) => {
                countries[countryCode] = name
                return fetch(`${BASE_URL}/PublicHolidays/${2025}/${countryCode}`)
                    .then(x => x.json())
                    .then(x => holidays.push(...x))
                    .catch(console.error)
                }
            ))
        })
        .then(() => {
            holidays = holidays.reduce((out, holiday) => {
                if (holiday?.date === dateString) {
                    out.push({
                        holiday: holiday.name,
                        country: countries[holiday.countryCode],
                        date: holiday.date
                    })
                }
                return out
            }, [])
            return holidays
        })
        .catch((error) => logger.error('Error fetching holidays.', error))
}

module.exports = {
    getCurrentHolidays,
    getDateString
}
