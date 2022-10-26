const env = process.env

const config = {
    db: {
        host: env.RDS_HOST,
        database: env.RDS_DB_NAME,
        user: env.RDS_USERNAME,
        password: env.RDS_PASSWORD,
        port: env.RDS_PORT,
        dialect: "mysql",
        dialectOptions: {
            ssl: {
                rejectUnauthorized: true,
            }
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
}

module.exports = config