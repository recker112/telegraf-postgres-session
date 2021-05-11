# PostgreSQL session middleware for Telegraf
## Installation
```
npm i telegraf-postgres-session
```
## Setup
Create table in your database

```SQL
CREATE TABLE postgress_sessions(id varchar, session varchar);
```

## Example
```js
const {Telegraf} = require('telegraf');
const PostgresSession = require('telegraf-postgres-session')

const bot = new Telegraf(process.env.BOT_TOKEN) // Your Bot token here

bot.use((new PostgresSession({
	connectionString: process.env.DATABASE_URL,
		ssl: {
			rejectUnauthorized: false
		}
})).middleware());

bot.on('message', ctx => {
    ctx.session.counter = ctx.session.counter ? ctx.session.counter : 0
    ctx.session.counter++
    ctx.reply(ctx.session.counter)
})

bot.launch()
```
The database connection configuration is described in The [PostgreSQL API](https://node-postgres.com).