import { version } from '../../package.json';
import { Router } from 'express';
import facets from './facets';
import microServiceMiddleware from './microServceMiddleware.js';
import { withAuth, login } from '../middleware/auth.js';

const api = ({ config, db }) => {

	const api = Router();
	const { 
		MS_NEWS = 'http://farmaciasolidaria.ddns.net:3000', 
		MS_LOCATION = 'https://farmaciasolidaria-location.herokuapp.com', 
		MS_MEDICINE = 'https://farmaciasolidaria-medicine.herokuapp.com' 
	} = process.env
	// mount the facets resource
	api.use('/facets', facets({ config, db }));

	api.use('/login', login)

	// Setup News Middleware
	if (MS_NEWS)
		api.use('/news',  microServiceMiddleware({ method: 'GET', url: MS_NEWS + '/wp-json/wp/v2/posts' }))

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