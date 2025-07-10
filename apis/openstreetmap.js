const fs = require('fs')
const axios = require('axios')
const { createCanvas, loadImage } = require('canvas')
const path = require('path')

const ZOOM = 10
const TILE_SIZE = 256

const NJ_BOUNDING_BOX = {
    lat1: 38.9,
    lat2: 41.4,
    lon1: -75.55,
    lon2: -73.85
}

async function fetchTile(x, y, zoom) {
    const tileUrl = `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`
    const response = await axios.get(tileUrl, { responseType: 'arraybuffer' })
    return loadImage(response.data)
}

function gpsToTile(lat, lon, zoom) {
    const x = Math.floor((lon + 180) / 360 * Math.pow(2, zoom))
    const y = Math.floor((1 - Math.log(Math.tan((Math.PI * lat) / 180) + 1 /
        Math.cos((Math.PI * lat) / 180)) / Math.PI) / 2 * Math.pow(2, zoom))
    return { x, y }
}

async function createMapWithMarkers(filename, areaCoords, markerLists) {
    const { x: x1, y: y1 } = gpsToTile(areaCoords.lat2, areaCoords.lon1, ZOOM)
    const { x: x2, y: y2 } = gpsToTile(areaCoords.lat1, areaCoords.lon2, ZOOM)

    const canvasWidth = (x2 - x1 + 1) * TILE_SIZE
    const canvasHeight = (y2 - y1 + 1) * TILE_SIZE

    const canvas = createCanvas(canvasWidth, canvasHeight)
    const ctx = canvas.getContext('2d')

    for (let x = x1; x <= x2; x++) {
        for (let y = y1; y <= y2; y++) {
            const tileImage = await fetchTile(x, y, ZOOM)
            ctx.drawImage(tileImage, (x - x1) * TILE_SIZE, (y - y1) * TILE_SIZE)
        }
    }

    for (const markerSet of markerLists) {
        ctx.fillStyle = markerSet.color || 'red'
        for (const [markerLat, markerLon] of markerSet.markers) {
            const pixelX = ((markerLon + 180) / 360) * Math.pow(2, ZOOM) *
                TILE_SIZE - x1 * TILE_SIZE
            const pixelY = ((1 - Math.log(Math.tan((Math.PI * markerLat) / 180) + 1 /
                Math.cos((Math.PI * markerLat) / 180)) / Math.PI) / 2) * Math.pow(2, ZOOM) *
                TILE_SIZE - y1 * TILE_SIZE
            
            ctx.beginPath()
            ctx.arc(pixelX, pixelY, (markerSet.size || 10), 0, 2 * Math.PI)
            ctx.fill()
        }
    }

    const buffer = canvas.toBuffer('image/png')
    const filePath = path.join(__dirname, 'openStreetMapImages', `${filename}.png`) // TODO
    fs.writeFileSync(filePath, buffer)
}

module.exports = { createMapWithMarkers, NJ_BOUNDING_BOX }
