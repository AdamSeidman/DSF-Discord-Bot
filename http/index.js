/* eslint-disable */

const url = 'http://localhost:8081/'

var sendRefresh = async function () {
    axios({
        method: 'post',
        url: url + 'refresh',
        data: {}
    })
}