module.exports = {
    email: {
        from: {
            name: "Офис Ставрополь",
            email: "khv-ivan@ya.ru" // fix
        },
        to: {
            name: "Октябрьское",
            email: "ihalx@mail.ru" // fix
        },
        subject: "Отчёты по топливу"
    },    
    reports: [
        {
            "templateName": "Нормы и пробег",
            "unitGroups": ["Малая техника", "Специалисты"],
            "outputFileName": "[Малая_техника_Специалисты]_Нормы_и_пробег",
            "periodType": globalThis.PeriodType.decade
        },
        {
            "templateName": "Нормы и пробег",
            "unitGroups": ["Малая техника", "Специалисты"],
            "outputFileName": "[Малая_техника_Специалисты]_Нормы_и_пробег",
            "periodType": globalThis.PeriodType.month
        },
        {
            "templateName": "Топливо и пробег",
            "unitGroups": ["Камазы", "Кировцы", "Комбайны"],
            "outputFileName": "[Камазы_Кировцы_Комбайны]_Топливо_и_пробег",
            "periodType": globalThis.PeriodType.decade
        },
        {
            "templateName": "Топливо и пробег",
            "unitGroups": ["Камазы", "Кировцы", "Комбайны"],
            "outputFileName": "[Камазы_Кировцы_Комбайны]_Топливо_и_пробег",
            "periodType": globalThis.PeriodType.month
        }
    ]
};