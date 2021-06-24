//#region Global Imports
import { createConnection, Connection } from 'typeorm';
//#endregion Global Imports

export default async (): Promise<Connection | undefined> => {
	try {
		return createConnection({
			type: 'postgres',
			host: process.env.TYPEORM_HOST, //env.
			port: +process.env.TYPEORM_PORT!,
			username: process.env.TYPEORM_USERNAME,
			password: process.env.TYPEORM_PASSWORD, // change based on the user to test it in local
			database: process.env.TYPEORM_DATABASE,
			synchronize: true, // Production Make It FALSE
			logging: 'all',
			logger: 'file', // For Console use - "advanced-console"
			entities: [__dirname + '/*'],
		});
	} catch (error) {
		return undefined;
	}
};
