const express = require('express')
var glob = require("glob")
const app = express()
const port = 3000
const fs = require('fs')
const prince = require('prince')

let dictionary = require('./fullDictionary.json')

const allowedOrigins = ["http://127.0.0.1:3000", "http://localhost:3000"];

let PROD = true

app.use(express.json());
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.post('/pdf', (req, res) => {
    let spells = req.body
    let html = '<div style="column-count: 2;margin-left: auto; margin-right: auto;">'
    for (const spell of spells) {
        html += spell.data.description.value
    }
    console.log(prince())
    prince()
        .inputs(html)
        .output("./player.pdf")
        .execute()
        .then(function () {
            var file = fs.createReadStream('./player.pdf');
            var stat = fs.statSync('./player.pdf');
            res.setHeader('Content-Length', stat.size);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=quote.pdf');
            file.pipe(res);
        }, function (error) {
            console.log("ERROR: ", util.inspect(error))

        })
    res.json(spells)
})

app.get('/wiki', (req, res) => {
    let shortID = req.query.id

    let item = dictionary.find(item => item.link.split("/")[1].includes(shortID))
    if (item) {
        let nameFR = item.nameFR
        let category = item.link.split("/")[0]
        let id = item.link.split("/")[1]

        fs.readFile("PF2E_data_FR/" + category + "/" + id + ".htm", "utf8", function (err, data) {
            if (err) {
                res.json(err)
            } else {
                let description = null

                if (!PROD) {
                    description = data.split("Description (fr) ------\r\n")[1] // NODE
                } else {
                    description = data.split("Description (fr) ------\n")[1] // PROD
                }

                if (description) {
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
                    res.json({ nameFR, descriptionFR })
                } else {
                    res.json({ descriptionFR: null })
                }
            }
        })
    } else {
        res.json(null)
    }

})

app.get('/getDataSets', (req, res) => {
    let category = req.query.cat
    glob("PF2E_data_EN/" + category + ".db/*.json", function (er, files) {
        readFiles(files).then(result => {
            res.json(result)
        })
    })
})

async function readFiles(files) {
    let out = {}
    for (const file of files) {
        const data = await fs.promises.readFile(file);
        let nameEN = file.split("/")[2].split(".json")[0]
        let fileData = Buffer.from(data);
        out[nameEN] = JSON.parse(fileData.toString())
    }
    return out
}

app.get('/', (req, res) => {
    res.send("Hello, I\'m a databse for Pathfinder 2!")
})

app.listen(process.env.PORT || 3001, () => {
    console.log(`Example app listening on port ${port}`)
})