export function success(message, data = {}) {
    return {
        success: true,
        message,
        data,
    };
}

export function error(message, code = 500) {
    return {
        success: false,
        code,
        message,
    };
}

export function unauthorized(message = "Unauthorized") {
    return error(message, 401);
}

export function forbidden(message = "Forbidden") {
    return error(message, 403);
}

export function notFound(message = "Not Found") {
    return error(message, 404);
}