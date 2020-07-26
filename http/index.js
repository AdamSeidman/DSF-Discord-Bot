/* eslint-disable */

const url = 'http://localhost:8081/'

var sendRefresh = function () {
    axios({
        method: 'post',
        url: url + 'refresh',
        data: {}
    })
    .then(data => console.log(data))
    .then(err => console.error(err))
}