// import express from "express";
let express = require("express");
let app = express();

app.set("port", process.env.PORT || 1059);
const port = app.get("port");

// import { login } from "./lib/wialonRequest.js";
let wialon = require("./lib/wialonRequest.js");

globalThis.PeriodType = Object.freeze({
    decade: 0,
    month: 1
});

app.get("/", (req, res) => {
    let input = {
        resourceName: "ЗАО Октябрьское",
        reps: [
            {
                templateName: "Нормы и пробег",
                unitGroups: ["Малая техника", "Специалисты"],
                outputFileName: "[Малая_техника_Специалисты]_Нормы_и_пробег",
                periodType: globalThis.PeriodType.decade
            },
            {
                templateName: "Нормы и пробег",
                unitGroups: ["Малая техника", "Специалисты"],
                outputFileName: "[Малая_техника_Специалисты]_Нормы_и_пробег",
                periodType: globalThis.PeriodType.month
            },
            {
                templateName: "Топливо и пробег",
                unitGroups: ["Камазы", "Кировцы", "Комбайны"],
                outputFileName: "[Камазы_Кировцы_Комбайны]_Топливо_и_пробег",
                periodType: globalThis.PeriodType.decade
            },
            {
                templateName: "Топливо и пробег",
                unitGroups: ["Камазы", "Кировцы", "Комбайны"],
                outputFileName: "[Камазы_Кировцы_Комбайны]_Топливо_и_пробег",
                periodType: globalThis.PeriodType.month
            }
        ]
    };
    wialon.get(input);
    res.send("get templates");
});


app.listen(port, () => {
    console.log(`WREP-SERVICE is running in ${app.get("env")} mode on http://localhost:${port}`);
});