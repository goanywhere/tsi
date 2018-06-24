var axios = require('axios');

async function nlpMessage(message) {
    var headers = {
        'Referer': 'https://cloud.google.com/natural-language/',
        'Origin': 'https://cloud.google.com',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36',
        'Content-Type': 'text/plain;charset=UTF-8'
    };

    var dataString = `{"document":{"type":"PLAIN_TEXT","content":"${message}"},"encodingType":"UTF16"}`;

    var options = {
        url: 'https://language.googleapis.com/v1/documents:analyzeSentiment?key=',
        method: 'POST',
        headers: headers,
        data: dataString
    };

    var options2 = {
        url: 'https://language.googleapis.com/v1/documents:analyzeEntitySentiment?key=',
        method: 'POST',
        headers: headers,
        data: dataString
    };

    let response = {}
    let response2 = {}

    try {
        response = await axios.request(options)
    } catch (err) { }
    try {
        response2 = await axios.request(options2)
    } catch (err) { }


    console.log("====================calling jim's precious api====================")
    return {
        sentiment: response.data,
        entity: response2.data
    }
}

module.exports = nlpMessage
