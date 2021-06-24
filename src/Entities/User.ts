import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'user' })
export class User {
	@PrimaryGeneratedColumn()
	id?: number;

	@Column({ nullable: false })
	name: string;

	@Column({ nullable: false })
	email: string;

	@Column({ nullable: false })
	password: string;

	@Column({ nullable: false, default: false })
	isAdmin: boolean;

	@Column({ nullable: false, default: false })
	isAuthor: boolean;

	@Column({ nullable: false, default: false })
	deleted: boolean;

	@Column('int',{  array: true })
	bookMarks: number[];

	constructor() {
		this.name = '';
		this.email = '';
		this.password = '';
		this.isAdmin = false;
		this.isAuthor = false;
		this.deleted = false;
		this.bookMarks = [];
	}
}

export class JwtPayload {
	userId?: number;
}
