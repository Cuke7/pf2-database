const express = require('express')
const app = express()
const port = 3000
const fs = require('fs')

let dictionary = require('./fullDictionary.json')

app.get('/', (req, res) => {
    let shortID = req.query.id

    let item = dictionary.find(item => item.link.split("/")[1].includes(shortID))
    let category = item.link.split("/")[0]
    let id = item.link.split("/")[1]

    fs.readFile("PF2E_data/" + category + "/" + id + ".htm", "utf8", function (err, data) {
        if (err) {
            res.json(err)
        } else {
            let descriptionFR = data.split("Description (fr) ------\r\n")[1]
            res.json({ descriptionFR })
        }
    })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})