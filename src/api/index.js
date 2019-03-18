import { version } from '../../package.json';
import { Router } from 'express';
import facets from './facets';
import microServiceMiddleware from './microServceMiddleware.js';

const api = ({ config, db }) => {

	const api = Router();
	const { MS_NEWS, MS_LOCATION, MS_MEDICINE } = process.env
	// mount the facets resource
	api.use('/facets', facets({ config, db }));

	// Setup News Middleware
	if (MS_NEWS)
		api.use('/news', microServiceMiddleware({ url: MS_NEWS + '/wp-json/wp/v2/posts' }))

	// Setup News Middleware
	if (MS_LOCATION)
		api.use('/location', microServiceMiddleware({ url: MS_LOCATION + '/pontos_de_apoio' }))

	// Setup Medicine Middleware
	if (MS_MEDICINE) {
		api.use('/medicine/stock', microServiceMiddleware({ url: MS_MEDICINE + '/estoque/acrescentar-ao-estoque' }))
		api.use('/medicine/request', microServiceMiddleware({ url: MS_MEDICINE + '/solicitacao' }))
		api.use('/medicine/types', microServiceMiddleware({ url: MS_MEDICINE + '/tipos' }))
		api.use('/medicine/status', microServiceMiddleware({ url: MS_MEDICINE + '/status' }))
		api.use('/medicine', microServiceMiddleware({ url: MS_MEDICINE+'/medicamentos' }))
	}



	// perhaps expose some API metadata at the root
	api.get('/', (req, res) => {
		res.json({ version });
	});

	return api;
}

export default api