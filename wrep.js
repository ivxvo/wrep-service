// import express from 'express';
let express = require('express');
let app = express();

app.set('port', process.env.PORT || 1059);
const port = app.get('port');

// import { login } from './lib/wialonRequest.js';
let wialon = require('./lib/wialonRequest.js');

app.get('/', (req, res) => {
    let intro = {
        resourceName: 'ЗАО Октябрьское',
        reps: [
            {
                templateName: 'Нормы и пробег',
                unitGroups: ['Малая техника', 'Специалисты']
            },
            {
                templateName: 'Топливо и пробег',
                unitGroups: ['Камазы', 'Кировцы', 'Комбайны']
            }
        ]
    };
    wialon.get(intro);
    res.send('get templates');
});


app.listen(port, () => {
    console.log(`WREP-SERVICE is running in ${app.get('env')} mode on http://localhost:${port}`);
});