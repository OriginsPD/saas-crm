import { status } from "elysia";

export type ValidationErrorBody = {
	code: "VALIDATION_ERROR";
	message: string;
	fieldErrors: Record<string, string[]>;
};

export type NotFoundErrorBody = {
	code: "NOT_FOUND";
	message: string;
};

export function validationError(
	message: string,
	fieldErrors: Record<string, string[]>,
): never {
	throw status(400, {
		code: "VALIDATION_ERROR",
		message,
		fieldErrors,
	} satisfies ValidationErrorBody);
}

export function notFoundError(message: string): never {
	throw status(404, {
		code: "NOT_FOUND",
		message,
	} satisfies NotFoundErrorBody);
}

export function validateCompanyInput(input: {
	name?: string;
}): Record<string, string[]> | null {
	const fieldErrors: Record<string, string[]> = {};

	if (!input.name?.trim()) {
		fieldErrors.name = ["Company name is required."];
	}

	return Object.keys(fieldErrors).length > 0 ? fieldErrors : null;
}
