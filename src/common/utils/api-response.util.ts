export function createApiResponse<T>(
    data: T,
    message = 'Success',
    code = 200,
    executionTime = new Date().toISOString(),
) {
    return {
        Code: code,
        ExecutionTime: executionTime,
        Message: message,
        Data: data,
    };
}
