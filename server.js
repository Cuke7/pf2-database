const express = require('express')
var glob = require("glob")
const app = express()
const port = 3000
const fs = require('fs')

let dictionary = require('./fullDictionary.json')


let PROD = false

app.use(express.json());
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.get('/wiki', getDataByID)

async function getDataByID(req, res) {
    let shortID = req.query.id
    let item = await getItemByID(shortID, true)
    if (item) {
        for (const reference of item.references) {
            reference.description = await getItemByID(reference.id, false)
        }
    }
    res.json(item)
}

async function getItemByID(shortID, getReferences) {
    return new Promise(function (resolve, reject) {
        let item = dictionary.find(item => item.link.split("/")[1].includes(shortID))
        if (item) {
            let nameFR = item.nameFR
            let category = item.link.split("/")[0]
            let id = item.link.split("/")[1]

            fs.readFile("PF2E_data_FR/" + category + "/" + id + ".htm", "utf8", function (err, data) {
                if (err) {
                    resolve({ descriptionFR: null })
                } else {
                    let description = null

                    if (!PROD) {
                        description = data.split("Description (fr) ------\r\n")[1] // NODE
                    } else {
                        description = data.split("Description (fr) ------\n")[1] // PROD
                    }

                    if (description) {

                        let references = []
                        let regex =
                            /@Compendium\[pf2e\.[ ]*?([A-z-0-9]*?)\.[ ]*?([A-z0-9]*?)\]\{(.*?)[\}|\]*]/gm;
                        let descriptionFR = description;
                        let matchs = descriptionFR.matchAll(regex);
                        for (const match of matchs) {

                            // descriptionFR = descriptionFR.replace(
                            //     match[0],
                            //     "<a href='/" + match[1] + "/" + match[2] + "'>" + match[3] + "</a>"
                            // );

                            descriptionFR = descriptionFR.replace(
                                match[0],
                                "<b>" + match[3] + "</b>"
                            );
                            references.push({
                                name: match[3],
                                id: match[2],
                            })

                        }
                        if (getReferences) {
                            resolve({ nameFR, descriptionFR, references })
                        }
                        resolve({ nameFR, descriptionFR })

                    } else {
                        resolve({ nameFR, descriptionFR: null, references: [] })
                    }
                }
            })
        } else {
            resolve(null)
        }
    });
}

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

app.listen(process.env.PORT || 3000, () => {
    console.log(`Example app listening on port ${port}`)
})