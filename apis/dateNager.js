const { copyObject } = require("logic-kit")

let holidays = []
const BASE_URL = 'https://date.nager.at/api/v3'

function getDateString() {
    return new Date().toLocaleDateString('en-CA', { timeZone: global.dsf.timeZone })
}

async function getCurrentHolidays() {
    const dateString = getDateString()
    if (holidays.length > 0 && holidays[0].date === dateString) {
        return copyObject(holidays)
    }
    const year = new Date().getFullYear()
    holidays = [{
        name: 'DSF Day',
        countryCode: 'DSF',
        date: `${year}-${
            String(global.dsf.dsfHolidayMonth).padStart(2, '0')}-${
            String(global.dsf.dsfHolidayDay).padStart(2, '0')}`
    }]
    const countries = { DSF: 'Global' }
    return await fetch(`${BASE_URL}/AvailableCountries`)
        .then(x => x.json())
        .then((data) => {
            return Promise.allSettled(data.map(({ countryCode, name }) => {
                countries[countryCode] = name
                return fetch(`${BASE_URL}/PublicHolidays/${year}/${countryCode}`)
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
