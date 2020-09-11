// middleware for wialon
let wialon = require("wialon");

// middleware - momentjs, date parser
let moment = require("moment");

// middleware - send http request
const needle = require("needle");

// work with File System
let fs = require("fs");

let sess;

exports.get = async (input) => {
    sess = login();

    if(!sess) {
        console.error("Сессия не инициализирована.");
        return;
    }

    let [resource, groups] = await Promise.all([
        getResourceWithTemplates(input.resourceName),
        getUnitGroups()
    ]);

    if(!resource || !resource.items || resource.items.length == 0) {
        console.error(`Ресурс не найден.\r\nresource:${resource}`);
        return;
    }
    if(!groups || !groups.items || groups.items.length == 0) {
        console.error(`Группы объектов не найдены.\r\ngroups:${groups}`);
        return;
    }

    let reportSaving, outputFileName;
    for(let rep of input.reps) {
        let template = getReportTemplateByName(resource, rep.templateName);
        if(!template) {
            console.error(`Шаблон отчёта не найден: '${rep.templateName}'.\r\ntemplate: ${template}`);
            continue;
        }

        let groupIds = [];
        for(let groupName of rep.unitGroups) {    
            let group = getUnitGroupByName(groups, groupName);
            if(!group) {
                console.error(`Группа объектов не найдена: '${groupName}'`);
                continue;
            }
            groupIds.push(group.id);
        }

        let reportRunParams = {
            resourceId: resource.items[0].id,
            templateId: template.id,
            groupIds: groupIds
        };

        if(reportSaving && reportSaving.isPending()) {
            await reportSaving;
        }

        try {        
            let cleanupResult = await execRequest("report/cleanup_result", {});
            if(!cleanupResult || cleanupResult.error !== 0) {
                console.warn("report/cleanup_result: ошибка удаления результата предыдущего отчёта.");                
            }
            await runReport(reportRunParams);
        }
        catch(err) {
            continue;
        }    

        reportSaving = makeQueryablePromise(execRequestSimple("report/export_result", { format: 8, compress: 0 }));
        outputFileName = rep.outputFileName.concat("_", moment().format("(DDMMYYYY_HHmm)"), ".xlsx");

        reportSaving
            .then((saveResult) => {
                fs.writeFile(`C:\\Users\\admin\\Documents\\temp\\${outputFileName}`, saveResult.body, (err) => {
                    if(err) {
                        console.log(`Ошибка записи в файл.\r\n${err}`);
                    } else {
                        console.log(`Report saved: ${outputFileName}`);
                    }
                });
            })
            .catch((err) => {
                console.error(`Ошибка экспорта отчёта: ${err}`);
            });
    }
    logout();
};

function makeQueryablePromise(promise) {
    if(promise.isFulfilled) {
        return promise;
    }

    let isPending = true,
        isFulfilled = false,
        isRejected = false;

    let result = promise.then((v) => {
        isFulfilled = true;
        isPending = false;
        return v;
    })
    .catch((e) => {
        isRejected = true;
        isPending = false;
        throw e;
    });

    result.isPending = function() { return isPending; };
    result.isFulfilled = function() { return isFulfilled; };
    result.isRejected = function() { return isRejected; };

    return result;
}

// exports.get = async(intro) => {
//     let p = {
//         token: "02c887c9569595d393fb2b9b333c707c9460A5EF043D54630F1CA02EA54B43096DD8A42A",
//         operateAs: "",
//         fl: 4
//     };
//     console.log(await execRequest("token/login", p));
// };

// вычислить период выполнения отчёта
function getPeriod() {
    let period = {};
    let today = moment().date();
    if(today > 10 && today < 21) {
        period.from = moment().startOf("month").unix();
        period.to = moment().set("date", 10).endOf("date").unix();
    }
    else if(today > 20 && today <= 31) {
        period.from = moment().set("date", 11).startOf("date").unix();
        period.to = moment().set("date", 20).endOf("date").unix();
    }
    else if(today >= 1  && today < 11) {
        period.from = moment().subtract(1, "month").set("date", 21).startOf("date").unix();
        period.to = moment().subtract(1, "month").endOf("month").unix();
    }
    return period;
}

// выполнить отчёт с параметрами
function runReport(params) {
    let dataReq = {
        reportResourceId: params.resourceId,
        reportTemplateId: params.templateId,
        reportObjectId: params.groupIds[0],
        reportObjectIdList: params.groupIds,
        reportObjectSecId: 0,
        interval: {
            from: getPeriod().from,
            to: getPeriod().to,
            flags: 0
        }
    };
    return execRequest("report/exec_report", dataReq)            
        .catch((err) => {
            console.error(`runReport: ${err}`);
            throw err;
        });
}

// получить группу ТС по имени группы
function getUnitGroupByName(groups, groupName) {
    return groups.items.find((group) => {
        return group.nm === groupName ? true: false;
    });        
}

// получить шаблон отчёта по имени из ресурса ("ЗАО Октябрьское")
function getReportTemplateByName(resource, templateName) {
    let objTemplates = resource.items[0].rep;
    if(!objTemplates) {
        return null;
    }
    let arrTemplates = Object.keys(objTemplates).map((key) => objTemplates[key]);
    return arrTemplates.find((template) => {
        return template.n === templateName ? true: false;
    });        
}

// запрос ресурса ("ЗАО Октябрьское") с шаблонами отчётов
// flags: 0x00000001 - базовый флаг (возвращает данные ресурсов, ретрансляторов, объектов, групп объектов, пользователей и маршрутов - в зависимости от itemsType)
// flags: 0x00002000 - шаблоны отчётов
// flags: 0x00002001 - данные о ресурсе + шаблоны отчётов
function getResourceWithTemplates(resourceName) {
    let dataReq = {
        itemsType: "avl_resource",
        propName: "sys_name",
        propValueMask: `${resourceName}`,
        flags: "0x00002001"
    };

    // let dataReq = {
    //     itemsType: "avl_resource",
    //     propName: "reporttemplates",
    //     propValueMask: "*", //`${resourceName}`,
    //     propType: "propitemname",
    //     flags: "0x00002001"
    // };

    // let data = getWialonData("core/search_items", dataReq)            
    //     .catch((err) => {
    //         console.error(`getResourceWithTemplates: ${err}`);
    //     });

    //     let id = 0;
    return getWialonData("core/search_items", dataReq)            
        .catch((err) => {
            console.error(`getResourceWithTemplates: ${err}`);
        });
}
    
// запрос группы ТС (камазы, кировцы, комбайны, ...)
// function getUnitGroups() {
//     let dataReq = {
//         itemsType: "avl_unit_group"
//     };
//     return new Promise((resolve, reject) => {
//         getWialonData("core/search_items", dataReq)
//             .then((unitGroup) => {
//                 resolve(unitGroup);
//             });
//     });
// }

function getUnitGroups() {
    let dataReq = {
        itemsType: "avl_unit_group"
    };
    return getWialonData("core/search_items", dataReq)
        .catch((err) => {
                console.error(`getUnitGroups: ${err}`);
        });
}

// формирование запроса на поиск данных в виалоне
// function getWialonData(svc, dataReq) {
//     let params = {
//         spec: {
//             itemsType: dataReq.itemsType ? `${dataReq.itemsType}`: "",
//             propName: dataReq.propName ? `${dataReq.propName}`: "",
//             propValueMask: dataReq.propValueMask ? `*${dataReq.propValueMask}*`: "",
//             sortType: "",
//             propType: dataReq.propType ? `${dataReq.propType}`: ""
//         },
//         force: 1,
//         flags: dataReq.flags ? `${dataReq.flags}`: "0x00000001",
//         from: dataReq.from ? dataReq.from: 0,
//         to: dataReq.to ? dataReq.to: 0
//     };
//     return new Promise((resolve, reject) => {
//         execRequest(svc, params)
//             .then((dataRes) => {
//                 resolve(dataRes);
//             })
//             .catch((err) => {
//                 reject(err);
//             });
//     });
// }

function getWialonData(svc, dataReq) {
    let params = {
        spec: {
            itemsType: dataReq.itemsType ? `${dataReq.itemsType}`: "",
            propName: dataReq.propName ? `${dataReq.propName}`: "",
            propValueMask: dataReq.propValueMask ? `*${dataReq.propValueMask}*`: "*",
            sortType: "",
            propType: dataReq.propType ? `${dataReq.propType}`: ""
        },
        force: 1,
        flags: dataReq.flags ? `${dataReq.flags}`: "0x00000001",
        from: dataReq.from ? dataReq.from: 0,
        to: dataReq.to ? dataReq.to: 0
    };
    return execRequest(svc, params);           
}

async function login() {
    let sess = wialon().session;
    try {
        await sess.start({ token: "02c887c9569595d393fb2b9b333c707cF44F06070B71EAC3BC715EFC3595338928F2D564" });
    }
    catch(err) {
        console.error(`Ошибка входа в Wialon.\r\n${err}`);
        return;
    }
    return sess;
    // запрос токена
    // access_type - уровень доступа (-1 - полный доступ)
    // duration - время жизни токена после активации, секунды: если 0 – время жизни бесконечно
    // Токен автоматически удаляется через 100 дней бездействия (даже с dur:0)!
    // http://hosting.wialon.com/login.html?client_id=wrep&access_type=-1&duration=0

    // let params = {
    //     authz: {
    //         token: "02c887c9569595d393fb2b9b333c707cF44F06070B71EAC3BC715EFC3595338928F2D564",
    //     }
    // };

    // return wialon(params).session;
}

async function logout() {
    let logoutResult = await execRequest("core/logout", {});
    if(!logoutResult || logoutResult.error !== 0) {
        console.warn("Ошибка выхода из Wialon");
    }
}

// выполнить запрос к виалону
// function execRequest(svc, params) {
//     return new Promise((resolve, reject) => {
//         sess.request(svc, params)
//             .then((data) => {
//                 // console.log(data);
//                 resolve(data);
//             })
//             .catch((err) => {
//                 // console.error(err);
//                 reject(err);
//             });
//     });
// }

function execRequest(svc, params) {
    return sess.request(svc, params);           
}

function execRequestSimple(svc, params) {
    let dataReq = {
        sid: sess._session.eid,
        svc: svc,
        params: JSON.stringify(params)
    };

    return needle("post", "https://hst-api.wialon.com/wialon/ajax.html", dataReq);
}