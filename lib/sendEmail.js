// middleware - send http request
const needle = require("needle");

// https://medium.com/@pablo127/google-api-authentication-with-oauth-2-on-the-example-of-gmail-a103c897fd98
// https://habr.com/ru/post/324982/

const clientId = "643488451855-k0k33r9c9k0893l2k77cr7jtqumag813.apps.googleusercontent.com";
const clientSecret = "QwdmogWuQ2DOYY6CfEasDe-8";
// !! при каждой попытке получения токена нужно получить заново код авторизации !!
const authorizationCode = "4/5AF3hPBPf5BxIJ9QmRkx70AVUX_-n4-TdtYXN2aAvMuUZDWnEWDJemION8CdJ8e2dl5PwG-iQcDYB3hKX1P2TLM";
const refreshToken = "1//0cGPIgOL73utACgYIARAAGAwSNwF-L9Ir1Xtw2EqJ78zi3dREZKjbjHNHBrQxRC4KJ6JrxwIQBQMAiR0XjDhgXxZ5vBKQs8tRLFs";

// module.exports = function sendEmail(subj, msg)
// {
//     sendRequest(
//         "POST", "https://www.googleapis.com/oauth2/v4/token",
//         { "Content-Type": "application/x-www-form-urlencoded" },
//         "client_id=537605607862-7lldmc265t2famk001vh0pl2boatidls.apps.googleusercontent.com&client_secret=5VTVKCDKThBIK3jHsHEmBqm9&grant_type=refresh_token&refresh_token=1//0cyttZgNiz1MOCgYIARAAGAwSNwF-L9Ir9_DUB7RBl4bxIoOhBMZGVKfILDvB8-to_gZEFbJoX3dc5Eli2UTODCg3zSN8ZtoI9lA",
//         function(response)
//         {
//             const accessToken = "Bearer " + response.access_token;
//             const me = "central26ru@gmail.com";
//             let body = `From: ${me}\r\n` +
//                     `To: ${me}\r\n` +
//                     // `To: bikermse@gmail.com\r\n` +
//                     "Subject: " + "=?UTF-8?B?" + `${btoa(unescape(encodeURIComponent(subj)))}` + "?="
//                     + "\r\n\r\n" + msg;

//             sendRequest("POST", `https://www.googleapis.com/upload/gmail/v1/users/${me}/messages/send`,
//                             {
//                                 "Content-Type": "message/rfc822",
//                                 Authorization: accessToken
//                             }, body, 
//                             function()
//                             {
//                                 console.log("Сообщение отправлено");
//                             }
//                         );
//         }
//     );
// };

// module.exports = async function sendEmail(subj, msg) {
//     let req = {
//         method: "post",
//         url: "https://www.googleapis.com/oauth2/v4/token",
//         data: "client_id=537605607862-7lldmc265t2famk001vh0pl2boatidls.apps.googleusercontent.com&client_secret=5VTVKCDKThBIK3jHsHEmBqm9&grant_type=refresh_token&refresh_token=1//0cyttZgNiz1MOCgYIARAAGAwSNwF-L9Ir9_DUB7RBl4bxIoOhBMZGVKfILDvB8-to_gZEFbJoX3dc5Eli2UTODCg3zSN8ZtoI9lA",
//         options: { "Content-Type": "application/x-www-form-urlencoded" }
//     };

//     let accessToken = await execRequest(req);

//     req = {
//         method: "post",
//         url: "https://www.googleapis.com/upload/gmail/v1/users/central26ru@gmail.com/messages/send",
//         data: "From: khv-ivan@ya.ru\r\n" +
//             "To: ihalx@mail.ru\r\n" +
//             // "To: zaosp04@mail.ru\r\n" +

//             "Subject: " + "=?UTF-8?B?" + `${Buffer.from(unescape(encodeURIComponent(subj))).toString("base64")}` + "?="
//             + "\r\n\r\n" + msg,
//         options: {
//             "Content-Type": "message/rfc822",
//             Authorization: accessToken
//         }
//     };

//     execRequest(req)
//         .then(() => {
//             console.log("Письмо отправлено.");
//         })
//         .catch((err) => {
//             console.log(`Ошибка отправки письма.\r\n${err}`);
//         });
// };

/*module.exports =*/ function send(msg) {
    let mimeMsg = createMimeMessage(msg);
    let req = {
                method: "post",
                url: "https://www.googleapis.com/upload/gmail/v1/users/central26ru@gmail.com/messages/send?uploadType=media",
                data: mimeMsg,
                options: {
                    "Content-Type": "message/rfc822",
                    Authorization: "Bearer " + getAccessToken()
                }
            };

    execRequest(req)
        .then(() => {
            console.log("Письмо отправлено.");
        })
        .catch((err) => {
            console.log(`Ошибка отправки письма.\r\n${err}`);
        });
}

module.exports.getRefreshToken = async function () {
    let dataReq = "code=" + authorizationCode + '&' + "client_id=" + clientId + '&' + "client_secret=" + clientSecret + '&' + "grant_type=authorization_code";
    let req = {
        method: "post",
        url: "https://www.googleapis.com/oauth2/v4/token",
        data: {
            code: authorizationCode,
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: "authorization_code",
            redirect_uri: "urn:ietf:wg:oauth:2.0:oob"
        },
        options: { "Content-Type": "application/x-www-form-urlencoded" }
    };

    let accessToken = await execRequest(req);    
    let id = 0;
};

async function getAccessToken() {
    let req = {
                method: "post",
                url: "https://www.googleapis.com/oauth2/v4/token",
                data: "client_id=537605607862-7lldmc265t2famk001vh0pl2boatidls.apps.googleusercontent.com&client_secret=5VTVKCDKThBIK3jHsHEmBqm9&grant_type=refresh_token&refresh_token=1//0cyttZgNiz1MOCgYIARAAGAwSNwF-L9Ir9_DUB7RBl4bxIoOhBMZGVKfILDvB8-to_gZEFbJoX3dc5Eli2UTODCg3zSN8ZtoI9lA",
                options: { "Content-Type": "application/x-www-form-urlencoded" }
            };
        
    let accessToken = await execRequest(req);

    execRequest(req)
    .then(() => {
        console.log("Письмо отправлено.");
    })
    .catch((err) => {
        console.log(`Ошибка отправки письма.\r\n${err}`);
    });
}

// code get from https://www.labnol.org/code/20132-gmail-api-send-mail-attachments
function createMimeMessage(msg) {
    let nl = "\n";
    let boundary = "__wrep_service__";

    let mimeBody = [
        "MIME-Version: 1.0",
        "To: " + encodeWithPrefix(msg.to.name) + "<" + msg.to.email + ">",
        "From: " + encodeWithPrefix(msg.from.name) + "<" + msg.from.email + ">",
        "Subject: " + encodeWithPrefix(msg.subject), // takes care of accented characters

        "Content-Type: multipart/mixed; boundary=" + boundary + nl,

        "--" + boundary,
        "Content-Type: text/plain; charset=UTF-8",
        "Content-Transfer-Encoding: base64" + nl,
        encode(msg.body.text) + nl,
    ];

    for (let i = 0; i < msg.files.length; i++) {
        let attachment = [
            "--" + boundary,
            "Content-Type: " + msg.files[i].mimeType + '; name="' + msg.files[i].fileName + '"',
            'Content-Disposition: attachment; filename="' + msg.files[i].fileName + '"',
            "Content-Transfer-Encoding: base64" + nl,
            msg.files[i].bytes
        ];
        mimeBody.push(attachment.join(nl));
    }

    mimeBody.push("--" + boundary + "--");

    return mimeBody.join(nl);
}

function encode(subj) {
    return Buffer.from(subj).toString("base64");
}

// UTF-8 characters in names and subject
function encodeWithPrefix(subj) {
    let encSubj = Buffer.from(subj).toString("base64");
    return "=?utf-8?B?" + encSubj + "?=";
}

function execRequest(req) {
    return needle(req.method, req.url, req.data, req.options);
}