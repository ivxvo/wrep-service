// import express from "express";
let express = require("express");
let app = express();

app.set("port", process.env.PORT || 1059);
const port = app.get("port");

// middleware - momentjs, date parser
let moment = require("moment");

// период отчёта - декада, месяц
globalThis.PeriodType = Object.freeze({
    decade: 0,
    month: 1
});

// результат отправки письма
globalThis.EmailResult = Object.freeze({
    Success: 0,
    Error: 1
});

// import { login } from "./lib/wialonRequest.js";
let wialon = require("./lib/wialonRequest.js");

let email = require("./lib/sendEmail.js");

let config = require("./lib/config.js");

app.get("/", async () => {

    //email.send({});

    let inputWialon = {
        resourceName: "ЗАО Октябрьское",
        reps: []
    };
    //Object.assign(inputWialon.reps, config.reports);

    for(let rep of config.reports) {
        let period = getPeriodUnix(rep.periodType);
        if(period && period.from && period.to) {
            rep.period.from = period.from;
            rep.period.to = period.to;
            rep.period.name = period.name;

            inputWialon.reps.push(rep);
        }
    }
    
    
    let reports = await wialon.getReports(inputWialon);

    if(!reports) {
        console.error(`reports=${reports}. Виалон не вернул ни одного отчёта.`);
        process.exit(1);
    }

    let emailParams = Object.assign({}, config.email);
    let period = getPeriod(globalThis.PeriodType.decade);
    emailParams.subject = period.name + " " + config.email.subject + " " + moment(period.from, "DD.MM.YYYY").format("DD") + "-" + period.to;
    let emailResult = await email.send(emailParams, reports.decade.files);

    if(emailResult === globalThis.EmailResult.Error)
    {
        process.exit(1);
    }

    if(reports.month.files.length > 0) {
        period = getPeriod(globalThis.PeriodType.month);
        emailParams.subject = period.name + " " + config.email.subject + " " + moment(period.from, "DD.MM.YYYY").format("DD") + "-" + period.to;
        await email.send(emailParams, reports.month.files);
    }
    

    // res.send("OK! Reports sended.");
    process.exit(0);
});

// вычислить период выполнения отчёта в Unix-формате
function getPeriodUnix(periodType) {
    let period = {};
    let today = moment().date();

    if(periodType === globalThis.PeriodType.decade) {
        if(today > 10 && today < 21) {
            period.name = moment().format("MM") + "-1";
            period.from = moment().startOf("month").unix();
            period.to = moment().set("date", 10).endOf("date").unix();
        }
        else if(today > 20 && today <= 31) {
            period.name = moment().format("MM") + "-2";
            period.from = moment().set("date", 11).startOf("date").unix();
            period.to = moment().set("date", 20).endOf("date").unix();
        }
        else if(today >= 1  && today < 11) {
            period.name = moment().subtract(1, "month").format("MM") + "-3";
            period.from = moment().subtract(1, "month").set("date", 21).startOf("date").unix();
            period.to = moment().subtract(1, "month").endOf("month").unix();
        }
    }
    else if(periodType === globalThis.PeriodType.month) {
        if(today >= 1 && today < 11) {
            period.name = moment().subtract(1, "month").format("MM");
            period.from = moment().subtract(1, "month").startOf("month").unix();
            period.to = moment().subtract(1, "month").endOf("month").unix();
        }
    }

    return period;
}

// вычислить период выполнения отчёта (для темы письма)
function getPeriod(periodType) {
    let period = {};
    let today = moment().date();

    if(periodType === globalThis.PeriodType.decade) {
        if(today > 10 && today < 21) {
            period.name = moment().format("MM") + "-1";
            period.from = moment().startOf("month").format("DD.MM.YYYY");
            period.to = moment().set("date", 10).format("DD.MM.YYYY");
        }
        else if(today > 20 && today <= 31) {
            period.name = moment().format("MM") + "-2";
            period.from = moment().set("date", 11).format("DD.MM.YYYY");
            period.to = moment().set("date", 20).format("DD.MM.YYYY");
        }
        else if(today >= 1  && today < 11) {
            period.name = moment().subtract(1, "month").format("MM") + "-3";
            period.from = moment().subtract(1, "month").set("date", 21).format("DD.MM.YYYY");
            period.to = moment().subtract(1, "month").endOf("month").format("DD.MM.YYYY");
        }
    }
    else if(periodType === globalThis.PeriodType.month) {
        if(today >= 1 && today < 11) {
            period.name = moment().subtract(1, "month").format("MM");
            period.from = moment().subtract(1, "month").startOf("month").format("DD.MM.YYYY");
            period.to = moment().subtract(1, "month").endOf("month").format("DD.MM.YYYY");
        }
    }

    return period;
}

app.listen(port, () => {
    console.log(`WREP-SERVICE is running in ${app.get("env")} mode on http://localhost:${port}`);
});