import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import initializeDb from './db';
import middleware from './middleware';
import api from './api';
import config from './config.json';
import fetch from 'node-fetch'


let app = express();
app.server = http.createServer(app);

// logger
app.use(morgan('dev'));

// 3rd party middleware
app.use(cors({
	exposedHeaders: config.corsHeaders
}));

// TODO: Use Body parser 
// app.use(bodyParser.json({
// 	limit: config.bodyLimit
// }));

// connect to db
initializeDb(db => {

	// internal middleware
	app.use(middleware({ config, db }));

	// api V1 router
	app.use('/api/v1', api({ config, db }));

	app.server.listen(process.env.PORT || config.port, () => {
		console.log(`Started on port ${app.server.address().port}`);
	});
});


//

app.get("/", function (req, res) {
	res.send(process.env)
})

app.get("/user", function (req, res) {
	let users = ['jiriquino', 'maxjf1', 'rrossete', 'souzajbr', 'maxjf1', 'rrossete', 'souzajbr', 'maxjf1', 'rrossete', 'souzajbr', 'maxjf1', 'rrossete', 'souzajbr', 'maxjf1', 'rrossete', 'souzajbr', 'maxjf1', 'rrossete', 'souzajbr']
	global.Promise
		.all(users.map(user =>
			user === 'jiriquino' ? global.Promise.reject(new Error('User not found')) :
				fetch('https://api.github.com/users/' + user)
					.then(res => res.json())
		))
		.then(data => res.json(data))
		.catch(error => res.status(500).send(error.message))
})

app.get("/user/:user", function (req, res) {
	fetch('https://api.github.com/users/' + req.params.user)
		.then(res => res.json())
		.then(data => {
			return {
				id: data.id,
				login: data.login,
				name: data.name 
			}
		})
		.then(data => res.json(data))
})

app.all("*", function (req, res) {
	res.status(404).send('404 Not found ' + req.url)
})

export default app;
