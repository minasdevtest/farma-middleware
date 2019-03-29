
/**	Creates a callback that proxies node callback style arguments to an Express Response object.
 *	@param {express.Response} res	Express HTTP Response
 *	@param {number} [status=200]	Status code to send on success
 *
 *	@example
 *		list(req, res) {
 *			collection.find({}, toRes(res));
 *		}
 */
export function toRes(res, status = 200) {
	return (err, thing) => {
		if (err) return res.status(500).send(err);

		if (thing && typeof thing.toObject === 'function') {
			thing = thing.toObject();
		}
		res.status(status).json(thing);
	};
}

export function rejectIfEmpty(message, status = 404) {
	return data => data ? data : Promise.reject(Object.assign(new Error(message), { status }))
}

export function promiseLog(message = '', level = 'log') {
	return data => console[level](message, data) || data
}

export function promiseCatchLog(message = '', level = 'error') {
	return data => console[level](message, data) || Promise.reject(data)
}