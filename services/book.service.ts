import { Context } from 'moleculer';
import { Action, BaseSchema, Method } from 'moleculer-decorators';
import { getConnection } from 'typeorm';
import connectionInstance from '../src/Entities/Connection';
import { Book } from '../src/Entities/Book';
import { BookRepository } from '../src/Repositories/Book';
import { ErrorHelper } from 'src/SharedHelper/ErrorHelper';

export class BookService extends BaseSchema {
	public name: string = 'book';
	public version: number = 1;
	public started: Function = async () => await connectionInstance();

	@Action({
		params: {
			bookList: 'array',
		},
	})
	public async listBooks(ctx: Context) {
		await ctx.call('v1.user.validate', { token: ctx.meta.jwt });

		if (!ctx.meta.isAdmin) {
			ErrorHelper.ThrowError('You are not authorized !', 401);
		}

		return await BookRepository.listBooks(ctx.params.bookList);
	}

	@Action({
		params: {
			filters: { type: 'array' },
			offset: 'string',
			limit: 'string',
		},
	})
	public async getAll(ctx: Context): Promise<{ items: Book[]; totalCount: number }> {
		let offset = ctx.params.offset && +ctx.params.offset > 0 ? +ctx.params.offset : 0,
			limit = ctx.params.limit && +ctx.params.limit > 0 ? +ctx.params.limit : 10;

		/*
		{
			key:'name',
			value:'adm',
			operation:'like' 
		}
		*/
		// *Filter items by preparing a query
		let queryList: string[] = [];
		ctx.params.filters.forEach((f: any) => {
			if (f.operation == 'In') {
				queryList.push(` '${f.value}' = any (${f.key})`);
			}

			if (f.operation == 'like') {
				queryList.push(`"${f.key}" ilike '%${f.value}%'`);
			}
		});
		const query = queryList.join(' and ');

		// * Paginate the data
		const response = await BookRepository.fetchAll(query, offset, limit);
		return { items: response[0], totalCount: response[1] };
	}

	@Action({
		params: {
			bookId: { type: 'string' },
		},
	})
	public async getById(ctx: Context): Promise<Book | undefined> {
		return await BookRepository.fetchById(+ctx.params.bookId);
	}

	@Action({
		params: {
			name: 'string',
			genre: 'array',
			description: 'string',
			authorName: 'string',
			pageCount: 'number',
			isDownloadable: 'boolean',
		},
	})
	public async createBook(ctx: Context) {
		await ctx.call('v1.user.validate', { token: ctx.meta.jwt });

		if (!ctx.meta.isAuthor) {
			ErrorHelper.ThrowError('You are not authorized !', 401);
		}

		const book: Book = new Book();

		book.name = ctx.params.name;
		book.genre = ctx.params.genre;
		book.description = ctx.params.description;
		book.authorName = ctx.params.authorName;
		book.pageCount = +ctx.params.pageCount;
		book.isDownloadable = ctx.params.isDownloadable;
		book.publishedDate = new Date();
		book.authorId = +ctx.meta.userId;

		return await BookRepository.saveBook(book);
	}

	@Action({
		params: {
			bookId: 'string',
			name: { type: 'string', optional: true },
			genre: { type: 'array', optional: true },
			description: { type: 'string', optional: true },
			authorName: { type: 'string', optional: true },
			pageCount: { type: 'number', optional: true },
			isDownloadable: { type: 'boolean', optional: true },
		},
	})
	public async updateBook(ctx: Context) {
		await ctx.call('v1.user.validate', { token: ctx.meta.jwt });

		if (!ctx.meta.isAuthor) {
			ErrorHelper.ThrowError('You are not authorized !', 401);
		}

		const book: Book = await BookRepository.fetchByAuthor(+ctx.params.bookId, +ctx.meta.userId);

		if (!book) {
			ErrorHelper.ThrowError('resource not found!', 404);
		}

		book.name = ctx.params.name || book.name;
		book.genre = ctx.params.genre || book.genre;
		book.description = ctx.params.description || book.description;
		book.authorName = ctx.params.authorName || book.authorName;
		book.pageCount = +ctx.params.pageCount || book.pageCount;
		book.isDownloadable = ctx.params.isDownloadable || book.isDownloadable;

		return await BookRepository.saveBook(book);
	}

	@Action({
		params: {
			bookId: { type: 'string' },
			isDownload: { type: 'boolean', optional: true },
			isBookmark: { type: 'boolean', optional: true },
		},
	})
	public async bookInfo(ctx: Context): Promise<any> {
		await ctx.call('v1.user.validate', { token: ctx.meta.jwt });

		const book: Book = await BookRepository.fetchById(+ctx.params.bookId);
		if (!book) {
			ErrorHelper.ThrowError('resource not found!', 404);
		}

		if (ctx.params.isBookmark) {
			return await ctx.call('v1.user.bookMark', { bookId: +ctx.params.bookId });
		}

		if (ctx.params.isDownload && !book.isDownloadable) {
			ErrorHelper.ThrowError('resource not for download!', 404);
		} else {
			//download book
		}

		return;
	}

	public stopped: Function = async () => await getConnection().close();
}

module.exports = new BookService();
