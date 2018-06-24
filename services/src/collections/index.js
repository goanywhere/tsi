var MongoClient = require('mongodb').MongoClient;

var DbConnection = function () {

    var db = null;
    var instance = 0;

    async function DbConnect() {
        try {
            let url = 'mongodb://localhost:27017';
            let conn = await MongoClient.connect(url);
            let _db = conn.db('hackathon')

            return _db
        } catch (e) {
            return e;
        }
    }

   async function Get() {
        try {
            instance++;
            if (db != null) {
                // console.log(`db connection is already alive`);
                return db;
            } else {
                console.log(`getting new db connection`);
                db = await DbConnect();
                return db; 
            }
        } catch (e) {
            return e;
        }
    }

    return {
        Get: Get
    }
}


module.exports = DbConnection();

