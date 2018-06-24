var mailClient = require('../services/mail-reader')
var deep = require('deep-get-set')
var mails = require('../collections/mails')
var nlp = require('../services/google-nlp')
var mailMap = require('../settings/usermapping.json')
var jobId

function mapToStar(score) {
    if (isNaN(score)) {
        return
    } else {
        if (score >= 0.7) {
            return 5
        } else if (score >= 0.4) {
            return 4
        } else if (score >= 0.1) {
            return 3
        } else if (score >= -0.5) {
            return 2
        } else if (score >= -0.8) {
            return 1
        } else {
            return 0
        }
    }
}

function startPolling() {
    jobId = setInterval(async () => {
        const result = await mailClient.getUnReadEmails()
        await Promise.all(result.map(async rec => {
            const exsitingRecs = await mails.query({ emailId: deep(rec, 'email.id') })
            if (exsitingRecs && Array.isArray(exsitingRecs) && exsitingRecs.length) {
                return
            } else {
                const nlpResult = await nlp(deep(rec, 'message.content'))
                const newMail = {
                    emailId: deep(rec, 'email.id'),
                    content: deep(rec, 'message.content'),
                    from: (((deep(rec, 'message.response.data.payload.headers') || []).find(rec => rec.name === 'From') || {}).value || 'placeholder@bar.com').match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi)[0],
                    time: new Date(((deep(rec, 'message.response.data.payload.headers') || []).find(rec => rec.name === 'Date') || {}).value || new Date()).getTime(),
                    analysis: nlpResult,
                    overAllScore: nlpResult.sentiment.documentSentiment.score,
                    overAllMagnitude: nlpResult.sentiment.documentSentiment.magnitude,
                }
                const keywords = nlpResult.entity.entities.reduce((result, rec) => {
                    result.push({
                        name: rec.name,
                        score: mapToStar(deep(rec, 'sentiment.score') || 0)
                    })
                    return result
                }, [])
                newMail.keywords = keywords
                newMail.from = newMail.from.toLowerCase()
                newMail.floor = mailMap[newMail.from].floor
                newMail.unit = mailMap[newMail.from].unit
                newMail.name = mailMap[newMail.from].name
                newMail.person = mailMap[newMail.from].person[Math.round(Math.random())]
                newMail.star = mapToStar(newMail.overAllScore)
                console.log('inserting rec')
                await mails.insert(newMail)
            }
        }))
        const queriedMails = await mails.query()
    }, 5000);
}
function stopPolling() {
    clearInterval(jobId);
}

module.exports = {
    startPolling,
    stopPolling
}