import { Errors } from 'moleculer';

export class ErrorHelper {
	static ThrowError(message?: string, statusCode?: number) {
		if (message == null) {
			message = '';
		}
		if (!statusCode || statusCode == null) {
			statusCode = 500;
		}
		throw new Errors.MoleculerError(`${message}`, statusCode);
	}
}
