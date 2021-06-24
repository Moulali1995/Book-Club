import { Context } from 'moleculer';
import { Action, BaseSchema, Method } from 'moleculer-decorators';
import { getConnection } from 'typeorm';
import connectionInstance from '../src/Entities/Connection';
import { UserRepository } from '../src/Repositories/User';
import { User, JwtPayload } from '../src/Entities/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ErrorHelper } from 'src/SharedHelper/ErrorHelper';

export class UserService extends BaseSchema {
	public name: string = 'user';
	public version: number = 1;
	public started: Function = async () => {
		await connectionInstance();
		await this.seedAdmin();
	};

	@Action({
		params: {
			name: 'string',
			email: 'string',
			password: 'string',
			confirmPassword: 'string',
			isAuthor: 'boolean',
		},
	})
	public async signUp(ctx: Context) {
		if (ctx.params.password != ctx.params.confirmPassword) {
			if (ctx.params.password.length < 8) {
				ErrorHelper.ThrowError('password length is less than 8 characters', 500);
			}
			ErrorHelper.ThrowError('Passwords does not match', 500);
		}

		const hash = await this.hashPassword(ctx.params.password);

		const user: User = new User();
		user.name = ctx.params.name;
		user.email = ctx.params.email;
		user.password = hash;
		user.isAuthor = ctx.params.isAuthor;

		return await UserRepository.saveUser(user);
	}

	@Action({
		params: {
			bookId: { type: 'number' },
		},
	})
	public async bookMark(ctx: Context) {
		const user: User = await UserRepository.fetchById(+ctx.meta.userId);
		user.bookMarks = [...new Set([...user.bookMarks, +ctx.params.bookId])];

		return await UserRepository.saveUser(user);
	}

	@Action({
		params: {
			email: { type: 'string' },
			password: { type: 'string' },
		},
	})
	public async login(ctx: Context) {
		return this.loginMethod(ctx);
	}

	@Method
	public async loginMethod(ctx: Context) {
		try {
			let { email, password } = ctx.params;
			const user: User = await UserRepository.fetchByEmail(email);

			if (!user) {
				ErrorHelper.ThrowError(`User not found !`, 500);
			}

			if (!bcrypt.compare(password, user.password)) {
				ErrorHelper.ThrowError(`Login failed! Password doesn't match !`, 500);
			}

			let token = await this.generateTokenMethod({
				userId: user.id!,
			});

			return { jwt: token };
		} catch (error) {
			return error.message;
		}
	}

	@Action({
		params: {
			token: { type: 'string' },
		},
	})
	public async validate(ctx: Context) {
		const decodedResponse = await this.verifyTokenMethod(ctx);
		if (!decodedResponse) {
			return ErrorHelper.ThrowError('JWT malformed', 500);
		}
		const user: User = await UserRepository.fetchById(+decodedResponse.userId!);
		ctx.meta.userId = user.id;
		ctx.meta.isAdmin = user.isAdmin;
		ctx.meta.isAuthor = user.isAuthor;

		return;
	}

	@Method
	public async verifyTokenMethod(ctx: Context) {
		let { token } = ctx.params;
		try {
			let secret: any = process.env.SECRET_KEY;
			let decoded = jwt.verify(token, secret);
			return decoded as JwtPayload;
		} catch (Error) {
			return false;
		}
	}

	@Method
	public async generateTokenMethod(payload: JwtPayload): Promise<string> {
		try {
			return jwt.sign(payload, process.env.SECRET_KEY!, {
				expiresIn: process.env.JWT_EXPIRESIN!,
			});
		} catch (error) {
			return error.message;
		}
	}

	@Method
	private async seedAdmin() {
		let user: User[] = await UserRepository.fetchAdmin();
		if (!user.length) {
			const user = new User();
			user.name = 'admin';
			user.email = 'admin@admin.com';
			user.password = await this.hashPassword('admin');
			user.isAdmin = true;

			return await UserRepository.saveUser(user);
		}
	}

	@Method
	private async hashPassword(password: string) {
		const saltRounds = 10;
		return bcrypt.hashSync(password, saltRounds);
	}

	public stopped: Function = async () => await getConnection().close();
}

module.exports = new UserService();
