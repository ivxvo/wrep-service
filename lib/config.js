const config = {
    email: {
        from: {
            name: "Офис Ставрополь",
            email: "spoctb@gmail.com"
        },
        to: {
            name: "Октябрьское",
            email: "zaosp04@mail.ru"
            // email: "spoctb@mail.ru"

        },
        subject: "Отчёты по топливу",
        text: "Здравствуйте!\r\nВо вложении отчёты по топливу"
    },
    auth: {
        clientId: "643488451855-k0k33r9c9k0893l2k77cr7jtqumag813.apps.googleusercontent.com",
        clientSecret: "QwdmogWuQ2DOYY6CfEasDe-8",
    // !! при каждой попытке получения токена (refreshToken) нужно получить заново код авторизации !!
    // const authorizationCode = "4/5AF3hPBPf5BxIJ9QmRkx70AVUX_-n4-TdtYXN2aAvMuUZDWnEWDJemION8CdJ8e2dl5PwG-iQcDYB3hKX1P2TLM";
        refreshToken: "1//0cGPIgOL73utACgYIARAAGAwSNwF-L9Ir1Xtw2EqJ78zi3dREZKjbjHNHBrQxRC4KJ6JrxwIQBQMAiR0XjDhgXxZ5vBKQs8tRLFs"
    },    
    reports: [
        {
            templateName: "Нормы и пробег",
            unitGroups: ["Малая техника", "Специалисты"],
            outputFileName: "[Малая_техника_Специалисты]_Нормы_и_пробег",
            periodType: globalThis.PeriodType.decade,
            period: {
                from: 0,
                to: 0
            },
            textInEmail: "- отчёт с нормами и пробегом для специалистов и малой техники",
            ext: ".xlsx"
        },
        {
            templateName: "Нормы и пробег",
            unitGroups: ["Малая техника", "Специалисты"],
            outputFileName: "[Малая_техника_Специалисты]_Нормы_и_пробег",
            periodType: globalThis.PeriodType.month,
            period: {
                from: 0,
                to: 0
            },
            textInEmail: "- отчёт с нормами и пробегом для специалистов и малой техники",
            ext: ".xlsx"
        },
        {
            templateName: "Топливо и пробег",
            unitGroups: ["Камазы", "Кировцы", "Комбайны"],
            outputFileName: "[Камазы_Кировцы_Комбайны]_Топливо_и_пробег",
            periodType: globalThis.PeriodType.decade,
            period: {
                from: 0,
                to: 0
            },
            textInEmail: "- отчёт с топливом и пробегом для техники, оборудованной ДУТ (камазы, кировцы, комбайны)",
            ext: ".xlsx"
        },
        {
            templateName: "Топливо и пробег",
            unitGroups: ["Камазы", "Кировцы", "Комбайны"],
            outputFileName: "[Камазы_Кировцы_Комбайны]_Топливо_и_пробег",
            periodType: globalThis.PeriodType.month,
            period: {
                from: 0,
                to: 0
            },
            textInEmail: "- отчёт с топливом и пробегом для техники, оборудованной ДУТ (камазы, кировцы, комбайны)",
            ext: ".xlsx"
        }
    ]
};

module.exports = config;