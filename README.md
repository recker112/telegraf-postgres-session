# PostgreSQL session middleware for Telegraf
## Installation
```
npm i telegraf-postgres-session
```
## Setup
Create table in your database

```SQL
CREATE TABLE postgress_sessions(id varchar PRIMARY KEY, session varchar);
```

## Example
```js
import { Telegraf } from 'telegraf';
import PostgresSession from 'telegraf-postgres-session';

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
});

bot.launch();
```

## Example with Typescript
```ts
import { Context, Telegraf } from 'telegraf';
import PostgresSession from 'telegraf-postgres-session';

interface SessionContext extends Context {
 session: any;
};

const bot: Telegraf<SessionContext> = new Telegraf(process.env.BOT_TOKEN as string);// Your Bot token here

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
});

bot.launch();
```
The database connection configuration is described in The [PostgreSQL API](https://node-postgres.com).
