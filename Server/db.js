const oracledb = require('oracledb');

try {
    
    oracledb.initOracleClient({ libDir: 'C:\\Users\\Anand Patekhede\\Downloads\\instantclient-basiclite-windows.x64-19.31.0.0.0dbru\\instantclient_19_31' });
} catch (err) {
    console.error("Error initializing Oracle Client (Thick mode):", err);
}

async function getConnection() {
    try {
        return await oracledb.getConnection({
            user: "LOGISTIC_DB",
            password: "admin123",
            connectString: "localhost:1521/orcl" 
        });
    }
    catch(err) {
        console.error("Error connecting to database: ", err);
    }
}

module.exports = getConnection;