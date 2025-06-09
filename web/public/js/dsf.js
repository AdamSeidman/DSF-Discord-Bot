function standardREQUEST(ep, query, options) {
    return new Promise((resolve, reject) => {
        try {
            let err = false
            fetch(`/api/${ep}${(typeof query !== 'undefined')? '?' : ''}${[(query || [])].flat().join('&')}`, options)
                .then(data => {
                    err = !data.ok
                    return data.json()
                })
                .then(json => {
                    if (err) {
                        reject(json)
                    } else {
                        resolve(json)
                    }
                })
                .catch(err => reject(err))
        } catch (error) {
            reject(error)
        }
    })
}

function standardGET(ep, query='') {
    return standardREQUEST(ep, query)
}

function standardVERB(ep, verb, data) {
    const requestOptions = {
        method: verb,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }
    return standardREQUEST(ep, undefined, requestOptions)
}

function standardPUT(ep, data) {
    return standardVERB(ep, 'PUT', data)
}

function standardPOST(ep, data) {
    return standardVERB(ep, 'POST', data)
}

function standardDELETE(ep, data) {
    return standardVERB(ep, 'DELETE', data)
}
