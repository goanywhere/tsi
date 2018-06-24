var mails = require('../collections/mails')
var mailMap = require('../settings/usermapping.json')

function list() {
    this.method = 'get';
    this.route = '/messages';
    this.callBack = async (request, reply) => {
        const q = {
            ...request.query,
            ...request.query.q && JSON.parse(request.query.q)
        }
        delete q.q
        const l = Number(q.limit) || 0
        delete q.limit
        const result = await mails.query(q, l)
        reply.send(result)
    }
}

function countAllMessages() {
    this.method = 'get';
    this.route = '/messages/total';
    this.callBack = async (request, reply) => {
        const q = {
            ...request.query,
            ...request.query.q && JSON.parse(request.query.q)
        }
        delete q.q
        const result = await mails.count(q)
        reply.send(result)
    }
}

function getRawForLineStack() {
    this.method = 'get';
    this.route = '/messages/line-stack';
    this.callBack = async (request, reply) => {
        const q = {
            ...request.query,
            ...request.query.q && JSON.parse(request.query.q)
        }
        delete q.q
        if (!q.from && !q.startTime && !q.endTime && !q.frameNum) {
            reply.send([])
            return
        }

        const interval = (q.endTime - q.startTime) / q.frameNum
        const timeFrames = []
        for (var i = 0; i < q.frameNum; i++) {
            timeFrames.push({
                seq: i,
                timePair: {
                    $gte: q.startTime + i * interval,
                    $lte: q.startTime + (i + 1) * interval
                }
            })
        }

        (q.endTime - q.startTime) / q.frameNum

        const queriedTenants = q.from.$in
        const framedTenantEmails = await Promise.all(queriedTenants.map(async tenantEmail => {
            return {
                name: (mailMap[tenantEmail] || {}).name,
                from: tenantEmail,
                framedEmails: await Promise.all(timeFrames.map(async frameOption => {
                    return {
                        seq: frameOption.seq,
                        result: await mails.count({
                            time: frameOption.timePair,
                            from: tenantEmail
                        })
                    }
                }))
            }
        }))
        const result = await framedTenantEmails
        reply.send(result)
    }
}

function getRawForBarBrush() {
    this.method = 'get';
    this.route = '/messages/bar-brush';
    this.callBack = async (request, reply) => {
        const q = {
            ...request.query,
            ...request.query.q && JSON.parse(request.query.q)
        }
        delete q.q
        if (!q.from) {
            reply.send([])
            return
        }

        const queriedTenants = q.from.$in
        const framedTenantEmails = await Promise.all(queriedTenants.map(async tenantEmail => {
            return {
                from: tenantEmail,
                sentiments: [
                    await mails.count({
                        from: tenantEmail,
                        overAllScore: {
                            $gte: 0.7
                        }
                    }),
                    await mails.count({
                        from: tenantEmail,
                        overAllScore: {
                            $lte: 0.6,
                            $gte: 0.4
                        }
                    }),
                    await mails.count({
                        from: tenantEmail,
                        overAllScore: {
                            $lte: 0.3,
                            $gte: 0.1
                        }
                    }),
                    await mails.count({
                        from: tenantEmail,
                        overAllScore: {
                            $lte: 0,
                            $gte: -0.5
                        }
                    }),
                    await mails.count({
                        from: tenantEmail,
                        overAllScore: {
                            $lte: -0.6
                        }
                    })
                ]
            }
        }))
        const result = await framedTenantEmails
        reply.send(result)
    }
}

function getRawForPie() {
    this.method = 'get';
    this.route = '/messages/pie';
    this.callBack = async (request, reply) => {
        const q = {
            ...request.query,
            ...request.query.q && JSON.parse(request.query.q)
        }
        delete q.q

        const d1 = await mails.query({
            overAllScore: {
                $gte: 0.9
            }
        })
        const d2 = await mails.query({
            overAllScore: {
                $lte: 0.8,
                $gte: 0.5
            }
        })
        const d3 = await mails.query({
            overAllScore: {
                $lte: 0.4,
                $gte: 0.1
            }
        })
        const d4 = await mails.query({
            overAllScore: {
                $lte: 0,
                $gte: -0.5
            }
        })
        const d5 = await mails.query({
            overAllScore: {
                $lte: -0.6
            }
        })

        const datasets = [d1, d2, d3, d4, d5]
        const result = datasets.map(mails => {
            const keywords = {}
            mails.map(mail => {
                if (mail.analysis.entity && mail.analysis.entity.entities) {
                    mail.analysis.entity.entities.forEach(entity=>{
                        keywords[entity.name] = (keywords[entity.name] || 0) + 1
                    })
                }
            })
            console.log(keywords)
            console.log(mails.length)
            const keysets = Object.keys(keywords).map((key) => {
                return {
                    key,
                    value: keywords[key]
                }
            }).sort((a, b) => {
                if (a.value < b.value)
                  return 1;
                if (a.value > b.value)
                  return -1;
                return 0;
            }).map(rec => rec.key)
            return {
                keysets,
                count: mails.length
            }
        })
        reply.send(result)
    }
}

module.exports = [list, countAllMessages, getRawForLineStack, getRawForBarBrush, getRawForPie]