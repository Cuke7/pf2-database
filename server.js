const express = require('express')
const app = express()
const port = 3000
const fs = require('fs')

let dictionary = require('./fullDictionary.json')

app.get('/wiki', (req, res) => {
    let shortID = req.query.id

    let item = dictionary.find(item => item.link.split("/")[1].includes(shortID))
    let category = item.link.split("/")[0]
    let id = item.link.split("/")[1]

    fs.readFile("PF2E_data/" + category + "/" + id + ".htm", "utf8", function (err, data) {
        if (err) {
            res.json(err)
        } else {
            console.log(data)
            let description = data.split("Description (fr) ------\r\n")[1]

            // if (description) {
            let regex =
                /@Compendium\[pf2e\.[ ]*?([A-z-0-9]*?)\.[ ]*?([A-z0-9]*?)\]\{(.*?)\}/gm;
            let descriptionFR = description;
            let matchs = descriptionFR.matchAll(regex);
            for (const match of matchs) {
                descriptionFR = descriptionFR.replace(
                    match[0],
                    "<a href='/" + match[1] + "/" + match[2] + "'>" + match[3] + "</a>"
                );
            }
            res.json({ descriptionFR })
            // } 
        }
    })
})

app.get('/', (req, res) => {
    res.send("Hello, I\'m a databse for Pathfinder 2!")
})

app.listen(process.env.PORT || 3000, () => {
    console.log(`Example app listening on port ${port}`)
})