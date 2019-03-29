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

	app.get("/", function (req, res) {
		res.send(process.env)
	})
	
	app.all("*", function (req, res) {
		res.send(404)
	})

	app.server.listen(process.env.PORT || config.port, () => {
		console.log(`Started on port ${app.server.address().port}`);
	});
});



export default app;
