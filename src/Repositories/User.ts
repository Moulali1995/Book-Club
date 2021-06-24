import { User } from '../Entities/User';
import { getRepository, UpdateResult } from 'typeorm';

export namespace UserRepository {
	export const saveUser = async (user: User): Promise<any> => {
		return await getRepository(User).save(user);
	};

	export const fetchById = async (id: number): Promise<any> => {
		return await getRepository(User).findOne({ id: id, deleted: false });
	};

	export const fetchByEmail = async (email: string): Promise<any> => {
		return await getRepository(User).findOne({ email: email, deleted: false });
	};

	export const fetchAdmin = async (): Promise<any> => {
		return await getRepository(User).find({ isAdmin: true });
	};
}
