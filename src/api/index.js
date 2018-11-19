import { version } from '../../package.json';
import { Router } from 'express';
import facets from './facets';
import microServiceMiddleware from './microServceMiddleware.js';

const api = ({ config, db }) => {
	let api = Router();

	// mount the facets resource
	api.use('/facets', facets({ config, db }));

	// Setup News Middleware
	if (process.env.MS_NEWS)
		api.use('/news', microServiceMiddleware({ url: process.env.MS_NEWS + '/wp-json/wp/v2' }))

	// perhaps expose some API metadata at the root
	api.get('/', (req, res) => {
		res.json({ version });
	});

	return api;
}

export default api