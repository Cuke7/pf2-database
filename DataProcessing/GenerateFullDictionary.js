//
// Don't forget to remove the first lines of dictionnaire-fr.md
//
const fs = require("fs");

// let inSearchDictionary = ["Actions",
//     "Aptitudes (Animal Companions)",
//     "Archétypes",
//     "Ascendances",
//     "Ascendances et classes (Animal Companions)",
//     "Bestiaire",
//     "Bénéfices (Animal Companions)",
//     "Capacités de classe",
//     "Capacités des ascendances",
//     "Capacités du bestiaire",
//     "Classes",
//     "Conditions",
//     "Divinités",
//     "Domaines",
//     "Dons",
//     "Historiques",
//     "Héritages des ascendances",
//     "Manœuvres avancées (Animal Companions)",
//     "Pouvoirs des familiers",
//     "Sorts",
//     "Équipement"]

// let searchDictionary = []
let fullDictionary = []
fs.readFile("./DataProcessing/dictionnaire-fr.md", "utf8", function (err, data) {
    if (err) throw err;
    let categories = data.split("##")

    for (let i = 1; i < categories.length; i++) {
        let category = categories[i]
        let categoryName = category.split("\n")[0].split("\r")[0]

        for (line of category.split("\n")) {
            if (line.includes("|[")) {
                let nameFR = line.split("](")[0].split("|[")[1]
                let nameEN = line.split("|")[2].split("|")[0]
                if (nameFR != "") {

                    fullDictionary.push({
                        nameFR: nameFR,
                        nameEN: nameEN,
                        link: line.split("](")[1].split(".htm)")[0],
                        inlineLink: line.split("|`")[1].split("]`")[0],
                        category: categoryName.trim()
                    })
                }
            }
        }

        // if (inSearchDictionary.includes(categoryName.trim())) {
        //     for (line of category.split("\n")) {
        //         if (line.includes("|[")) {
        //             let name = line.split("](")[0].split("|[")[1]
        //             if (name != "") {
        //                 searchDictionary.push({
        //                     name: name,
        //                     link: line.split("](")[1].split(".htm)")[0],
        //                     inlineLink: line.split("|`")[1].split("]`")[0],
        //                     category: categoryName.trim()
        //                 })
        //             }
        //         }
        //     }
        // }
    }
    // fs.writeFileSync("searchDictionary.json", JSON.stringify(searchDictionary));
    fs.writeFileSync("./fullDictionary.json", JSON.stringify(fullDictionary));
});

