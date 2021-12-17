// NOTA(RECKER): Conectarse a la DB
const { Client } = require('pg');

let sessions = {};

class PostgresSession {
	constructor (options) {
		this.options = Object.assign({
			property: 'session',
		}, options);
	}
	
	getSessionKey(ctx) { 
		let chat_id = '';
		if (ctx.updateType === 'callback_query') {
			ctx = ctx.update.callback_query;
			chat_id = ctx.message.chat.id;
		} else if (ctx.updateType === 'inline_query'){
			ctx = ctx.update.inline_query;
			chat_id = ctx.from.id;
		}
		else {
			chat_id = ctx.chat.id;
		}
		if (!ctx.from || !chat_id) {
			return ;
		}
		return `${chat_id}:${ctx.from.id}`
	}
	
	getSessionPostgres (key, cached = true) {
		if (sessions[key] && cached) return { then: function (fn) { fn(sessions[key]) } };
		
		const client = new Client(this.options);
		client.connect();
		
		return client.query(`SELECT session FROM postgress_sessions WHERE id='${key}'`).then((res) => {
			let session = {};
			let response = res;

			if (response.rows.length) {
				response = response.rows[0].session;
				try {
					session = JSON.parse(response);
				} catch(e) {
					console.log('Error parse JSON', response, e);
				}
			}
			
			client.end();
			sessions[key] = session;
      return session;
		}).catch((e) => {
			let session = {};
			client.end();
			sessions[key] = session;
      return session;
		});
	}
	saveSessionPostgress (key, session) {
		const client = new Client(this.options);
		client.connect();
		
		if (!session || Object.keys(session).length === 0) {
			return client.query(`DELETE FROM postgress_sessions WHERE id='${key}'`).then(()=>{
				client.end();
			}).catch((e) => {
				client.end();
			});
		}

		const sessionString = JSON.stringify(session);
		return client.query(`INSERT INTO postgress_sessions (id,session) VALUES ('${key}','${sessionString}')`).then(() => {
			//console.log('CREADO');
			return client.end();
		}).catch(() => {
			client.query(`UPDATE postgress_sessions SET session='${sessionString}' WHERE id='${key}'`).then(() => {
				//console.log('GUARDADO');
				return client.end();
			}).catch((e) => {
				console.log('Error al guardar',e);
				return client.end();
			});
		});
	}
	
	middleware() {
		return async (ctx, next) => {
			const key = this.getSessionKey(ctx);
			if (!key) {
				return next();
			}
			
			
			return this.getSessionPostgres(key).then(() => {
				ctx.session = sessions[key];
				return next().then(() => {
					return this.saveSessionPostgress(key, sessions[key]);
				})
			});
		}
	}
}

module.exports = PostgresSession;