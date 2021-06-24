import { Context, ServiceSchema } from 'moleculer';
import ApiGateway = require('moleculer-web');

const ApiService: ServiceSchema = {
	name: 'v1',

	mixins: [ApiGateway],

	// More info about settings: https://moleculer.services/docs/0.13/moleculer-web.html
	settings: {
		port: process.env.PORT || 3000,

		routes: [
			{
				aliases: {
					//user
					'POST user/login': 'v1.user.login',
					'POST user/signup': 'v1.user.signUp',

					//book
					'PUT book/list-books': 'v1.book.listBooks',
					'POST book/filter': 'v1.book.getAll',
					'GET book/:bookId': 'v1.book.getById',
					'POST book/create': 'v1.book.createBook',
					'PUT book/:bookId/update': 'v1.book.updateBook',
					'PUT book/:bookId/info': 'v1.book.bookInfo',
				},

				mappingPolicy: 'restrict',
				cors: {
					credentials: true,
					methods: ['GET', 'OPTIONS', 'POST'],
					origin: ['*'],
				},
				path: '/v1',
				onBeforeCall(ctx: Context, route: any, req: any, res: any) {
					ctx.meta.jwt = req.headers['jwt'];
				},

				onAfterCall(ctx: Context, route: any, req: any, res: any, data: any) {
					return { data: data };
				},
			},
		],

		// Serve assets from 'public' folder
		assets: {
			folder: 'public',
		},
	},
};

export = ApiService;
