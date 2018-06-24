import axios from 'axios'
import deep from 'deep-get-set'

const SERVER_ADDR = 'http://10.2.12.201:3000'

function initLocalStorage (results) {
  const alreadyReadKeys = localStorage.getItem('ALREADY_READ_KEY')
  if (!alreadyReadKeys) {
    const ids = []
    results.map(result => {
      ids.push(result._id)
    })
    localStorage.setItem('ALREADY_READ_KEY', JSON.stringify(ids))
  }
}

async function getLineStackData (from, start, end, interval = 10) {
  const result = await axios.get(`${SERVER_ADDR}/messages/line-stack`, {
    params: {
      q: JSON.stringify({
        from: {
          $in: from
        },
        startTime: (new Date(start)).getTime(),
        endTime: (new Date(end)).getTime(),
        frameNum: interval
      })
    }
  })
  return result.data
}

async function getBarBrushData (from) {
  const result = await axios.get(`${SERVER_ADDR}/messages/bar-brush`, {
    params: {
      q: JSON.stringify({
        from: {
          $in: from
        }
      })
    }
  })
  return result.data
}

async function getPieData (from) {
  const result = await axios.get(`${SERVER_ADDR}/messages/pie`)
  return result.data
}

async function getParsedMessages () {
  const response = await axios.get(`${SERVER_ADDR}/messages`)
  const messages = response.data
  initLocalStorage(messages)
  const result = {
    '1F': {},
    '2F': {},
    '3F': {}
  }
  messages.forEach(message => {
    if (!deep(result, [message.floor, message.unit])) {
      deep(result, [message.floor, message.unit], {
        name: message.name,
        messages: []
      })
    }
    result[message.floor][message.unit].messages.unshift(
      {
        id: message._id,
        content: message.content,
        star: message.star,
        person: message.person,
        keywords: message.keywords,
        time: new Date(message.time)
      }
    )
  })
  Object.values(result).forEach(floor => {
    Object.values(floor).forEach(tenant => {
      tenant.averageStar =
        (tenant.messages.reduce((total, rec) => total + rec.star, 0)) / (tenant.messages.length || 1)
    })
  })
  return result
}

export {
  getLineStackData,
  getBarBrushData,
  getPieData,
  getParsedMessages
}
