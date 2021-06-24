import { Book } from '../Entities/Book';
import { getConnection, getRepository, In } from 'typeorm';

export namespace BookRepository {
	export const saveBook = async (book: Book): Promise<any> => {
		return await getRepository(Book).save(book);
	};

	export const fetchById = async (id: number): Promise<any> => {
		return await getRepository(Book).findOne({ id: id, deleted: false });
	};

	export const fetchByAuthor = async (id: number, authorId: number): Promise<any> => {
		return await getRepository(Book).findOne({ id: id, authorId: authorId });
	};

	export const fetchAll = async (filter: any, offset: number, limit: number): Promise<any> => {
		return await getRepository(Book)
			.createQueryBuilder()
			.where(filter)
			.offset(offset)
			.limit(limit)
			.getManyAndCount();
	};

	export const listBooks = async (bookList: number[]): Promise<any> => {
		return await getConnection()
			.createQueryBuilder()
			.update(Book)
			.set({ isListed: true })
			.where({
				id: In(bookList),
				deleted: false,
			})
			.execute();
	};
}
