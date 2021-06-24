import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'book' })
export class Book {
	@PrimaryGeneratedColumn()
	id?: number;

	@Column({ nullable: false })
	name: string;

	@Column({ type: 'text', array: true })
	genre: string[];

	@Column({ type: 'text' })
	description: string;

	@Column({ nullable: false })
	authorName: string;

	@Column({ nullable: false })
	publishedDate?: Date;

	@Column({ nullable: false })
	pageCount: number;

	@Column({ nullable: false, default: false })
	deleted: boolean;

	@Column({ nullable: false, default: false })
	isListed: boolean;

	@Column({ nullable: false, default: false })
	isDownloadable: boolean;

	@Column({ nullable: false })
	authorId?: number;

	@Column({ nullable: false })
	rating: number;

	constructor() {
		this.genre = [];
		this.name = '';
		this.description = '';
		this.authorName = '';
		this.pageCount = 0;
		this.deleted = false;
		this.isListed = false;
		this.isDownloadable = false;
		this.rating = 0;
	}
}
