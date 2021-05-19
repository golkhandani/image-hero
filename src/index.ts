import './pre-start'; // Must be the first import
import app from '@server';
import logger from '@shared/Logger';

// get the client
import mysql from "mysql2/promise";
import { runCrawlerScheduler } from './services/crawler';
// create the connection to database
// Start the server
async function main() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        port:3306,
        user: 'root',
        password: "password",
        database: 'OnPay'
      });

    runCrawlerScheduler(connection)
    const port = Number(process.env.PORT || 3000);
    app.set("db", connection);
    app.listen(port, () => {
        logger.info('Express server started on port: ' + port);
    });
    
}
main()
