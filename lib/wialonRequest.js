// middleware for wialon
let wialon = require('wialon');

// middleware - momentjs, date parser
let moment = require('moment');

let sess = login();

exports.get = (intro) => {
    getResourceWithTemplates(intro.resourceName)
        .then((resource) => {
            let resourceId = resource.items[0].id;
            for(let rep of intro.reps) {
                let template = getReportTemplateByName(resource, rep.templateName);
                getUnitGroups()
                    .then((groups) => {
                        let groupIds = [];
                        for(let groupName of rep.unitGroups) {                                
                            groupIds.push(getUnitGroupByName(groups, groupName).id);
                        }                        
                        runReport({ resourceId: resourceId, templateId: template.id, groupIds: groupIds})
                            .then((report) => {

                            });
                        let id = 0;
                    });
                
            }
            
        });

    
    
       
};



// выполнить отчёт с параметрами
function runReport(params) {
    let dataReq = {
        reportResourceId: params.resourceId,
        reportTemplateId: params.templateId,
        reportObjectIdList: params.groupIds,
        interval: {
            from: params.from,
            to: params.to,
            flags: 0
        }
    };
    return new Promise((resolve, reject) => {
        execRequest('report/exec_report', dataReq)
            .then((report) => {
                resolve(report);
            });
    });
}

// получить группу ТС по имени группы
function getUnitGroupByName(groups, groupName) {
    return groups.items.find((group) => {
        return group.nm === groupName ? true: false;
    });        
}

// получить шаблон отчёта по имени из ресурса ('ЗАО Октябрьское')
function getReportTemplateByName(resource, templateName) {
    let objTemplates = resource.items[0].rep;
    let arrTemplates = Object.keys(objTemplates).map((key) => objTemplates[key]);
    return arrTemplates.find((template) => {
        return template.n === templateName ? true: false;
    });        
}

// запрос ресурса ('ЗАО Октябрьское') с шаблонами отчётов
// flags: 0x00000001 - базовый флаг (возвращает данные ресурсов, ретрансляторов, объектов, групп объектов, пользователей и маршрутов - в зависимости от itemsType)
// flags: 0x00002000 - шаблоны отчётов
// flags: 0x00002001 - данные о ресурсе + шаблоны отчётов
function getResourceWithTemplates(resourceName) {
    let dataReq = {
        itemsType: 'avl_resource',
        propName: 'sys_name',
        propValueMask: `*${resourceName}*`,
        flags: '0x00002001'
    };
    return new Promise((resolve, reject) => {
        getWialonData('core/search_items', dataReq)
            .then((resource) => {
                resolve(resource);
            });
    });
}
    
// запрос группы ТС (камазы, кировцы, комбайны, ...)
function getUnitGroups() {
    dataReq = {
        itemsType: 'avl_unit_group'
    };
    return new Promise((resolve, reject) => {
        getWialonData('core/search_items', dataReq)
            .then((unitGroup) => {
                resolve(unitGroup);
            });
    });
}

// формирование запроса на поиск данных в виалоне
function getWialonData(svc, dataReq) {
    let params = {
        spec: {
            itemsType: dataReq.itemsType ? `${dataReq.itemsType}`: '',
            propName: dataReq.propName ? `${dataReq.propName}`: '',
            propValueMask: dataReq.propValueMask ? `*${dataReq.propValueMask}*`: '',
            sortType: '',
            propType: dataReq.propType ? `${dataReq.propType}`: ''
        },
        force: 1,
        flags: dataReq.flags ? `${dataReq.flags}`: '0x00000001',
        from: dataReq.from ? dataReq.from: 0,
        to: dataReq.to ? dataReq.to: 0
    };
    return new Promise((resolve, reject) => {
        execRequest(svc, params)
            .then((dataRes) => {
                resolve(dataRes);
            })
            .catch((err) => {
                reject(err);
            });
    });
}

function login() {
    // let sess = wialon().session;
    // sess.start({ token: '02c887c9569595d393fb2b9b333c707cC1A82050B1274C28138AEFEC49EA9570D52712EE' })
    //     .then((data) => {
    //         console.log('LOGIN:');
    //         console.log(data);
    //     })
    //     .catch((err) => {
    //         console.log(err);
    //     });

    let params = {
        authz: {
            token: '02c887c9569595d393fb2b9b333c707cC1A82050B1274C28138AEFEC49EA9570D52712EE',
        }
    };

    return wialon(params).session;
}

// выполнить запрос к виалону
function execRequest(svc, params){
    return new Promise((resolve, reject) => {
        sess.request(svc, params)
            .then((data) => {
                console.log(data);
                resolve(data);
            })
            .catch((err) => {
                // console.log(err);
                reject(err);
            });
    });
}