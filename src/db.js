import Mongoose from "mongoose";
import User, { hashPassword } from './models/user'

const {
	MONGODB_URI,
	GATEWAY_ADMIN_USER = 'admin',
	GATEWAY_ADMIN_PASSWORD = 'admin',
	GATEWAY_ADMIN_EMAIL = 'admin@example.com',
} = process.env;
console.warn('42', MONGODB_URI)
const connect = callback => {
	// connect to a database if needed, then pass it to `callback`:
	Mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
		.then(err => {
			console.info('[MONGODB] Database connected.')
			const admin = { name: GATEWAY_ADMIN_USER, email: GATEWAY_ADMIN_EMAIL, password: GATEWAY_ADMIN_PASSWORD, roles: ['admin'] }
			hashPassword(GATEWAY_ADMIN_PASSWORD)
				.then(password => admin.password = password)
				.then(() => User.findByEmail(GATEWAY_ADMIN_EMAIL))
				.then(user => user ?
					User.updateOne(user, admin, { runValidators: true }) :
					User.create(admin)
				)
				.then(() => User.findByEmail(GATEWAY_ADMIN_EMAIL))
				.then(res => console.info('[MONGODB] Inserted base admin', res))
				.then(() => callback({ User }))
				.catch(err => {
					console.error(`[MONGODB] Insert base admin error:`, err.message);
					process.exit(1);

				})
		})
		.catch(err => {
			console.error(`[MONGODB] MongoDB Connection:`, err);
			process.exit(1);
		})

}

export default connect