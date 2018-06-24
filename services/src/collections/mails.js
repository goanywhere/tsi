var DbConnection = require('.');

async function insert(data) {
    try {
        let db = await DbConnection.Get();

        let duplicate = await db.collection('mails').find({
            id: data.id
        });
        let result = await db.collection('mails').insert(data);

        return result;
    } catch (e) {
        return e;
    }
}

async function query(params, l = 0) {
    try {
        let db = await DbConnection.Get();
        // console.log('querying mails with query.')
        console.log(params)
        let result = await db.collection('mails').find(params).limit(l);

        return result.toArray();
    } catch (e) {
        return e;
    }
}

async function count(params) {
    try {
        let db = await DbConnection.Get();
        // console.log('querying mails with query.')
        console.log(params)
        let result = await db.collection('mails').count(params);

        return result;
    } catch (e) {
        return e;
    }
}

function getRandomDate(minimum, maximum){
    var randomnumber = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum
}

function assignRandomDate() {
    
}

module.exports = {
    insert,
    query,
    count
};
