export interface HttpStatus {
	code: number;
	name: string;
	category: string;
	description: string;
}

export const HTTP_STATUSES: HttpStatus[] = [
	{ code: 100, name: "Continue", category: "1xx Informational", description: "The server has received the request headers and the client should proceed to send the request body." },
	{ code: 101, name: "Switching Protocols", category: "1xx Informational", description: "The requester has asked the server to switch protocols (e.g., to WebSocket)." },
	{ code: 103, name: "Early Hints", category: "1xx Informational", description: "Used to return some response headers before final HTTP message." },

	{ code: 200, name: "OK", category: "2xx Success", description: "Standard response for successful HTTP requests." },
	{ code: 201, name: "Created", category: "2xx Success", description: "The request has been fulfilled, resulting in a new resource." },
	{ code: 202, name: "Accepted", category: "2xx Success", description: "The request has been accepted for processing, but the processing has not been completed." },
	{ code: 204, name: "No Content", category: "2xx Success", description: "The server successfully processed the request and is not returning any content." },
	{ code: 206, name: "Partial Content", category: "2xx Success", description: "The server is delivering only part of the resource due to a range header." },

	{ code: 301, name: "Moved Permanently", category: "3xx Redirection", description: "This and all future requests should be directed to the given URI." },
	{ code: 302, name: "Found", category: "3xx Redirection", description: "Tells the client to look at another URL (temporary redirect)." },
	{ code: 303, name: "See Other", category: "3xx Redirection", description: "The response can be found under another URI using GET." },
	{ code: 304, name: "Not Modified", category: "3xx Redirection", description: "The resource has not been modified since the last request." },
	{ code: 307, name: "Temporary Redirect", category: "3xx Redirection", description: "Repeat the request to another URI without changing the method." },
	{ code: 308, name: "Permanent Redirect", category: "3xx Redirection", description: "Repeat the request to another URI permanently without changing the method." },

	{ code: 400, name: "Bad Request", category: "4xx Client Error", description: "The server cannot or will not process the request due to a client error." },
	{ code: 401, name: "Unauthorized", category: "4xx Client Error", description: "Authentication is required and has failed or has not yet been provided." },
	{ code: 403, name: "Forbidden", category: "4xx Client Error", description: "The request was valid, but the server is refusing action." },
	{ code: 404, name: "Not Found", category: "4xx Client Error", description: "The requested resource could not be found." },
	{ code: 405, name: "Method Not Allowed", category: "4xx Client Error", description: "The request method is not supported for the target resource." },
	{ code: 408, name: "Request Timeout", category: "4xx Client Error", description: "The server timed out waiting for the request." },
	{ code: 409, name: "Conflict", category: "4xx Client Error", description: "Indicates a request conflict with the current state of the target resource." },
	{ code: 410, name: "Gone", category: "4xx Client Error", description: "Indicates that the resource is no longer available and will not be available again." },
	{ code: 413, name: "Payload Too Large", category: "4xx Client Error", description: "The request entity is larger than limits defined by server." },
	{ code: 415, name: "Unsupported Media Type", category: "4xx Client Error", description: "The request entity has a media type which the server does not support." },
	{ code: 418, name: "I'm a teapot", category: "4xx Client Error", description: "The server refuses the attempt to brew coffee with a teapot." },
	{ code: 422, name: "Unprocessable Content", category: "4xx Client Error", description: "The request was well-formed but could not be processed semantically." },
	{ code: 425, name: "Too Early", category: "4xx Client Error", description: "Server is unwilling to process a request that might be replayed." },
	{ code: 429, name: "Too Many Requests", category: "4xx Client Error", description: "The user has sent too many requests in a given time window (rate limiting)." },

	{ code: 500, name: "Internal Server Error", category: "5xx Server Error", description: "A generic error message when an unexpected condition was encountered." },
	{ code: 501, name: "Not Implemented", category: "5xx Server Error", description: "The server either does not recognize the request method, or it lacks the ability to fulfill the request." },
	{ code: 502, name: "Bad Gateway", category: "5xx Server Error", description: "The server was acting as a gateway and received an invalid response from the upstream server." },
	{ code: 503, name: "Service Unavailable", category: "5xx Server Error", description: "The server is currently unavailable (overloaded or down for maintenance)." },
	{ code: 504, name: "Gateway Timeout", category: "5xx Server Error", description: "The server was acting as a gateway and did not receive a timely response from the upstream server." },
	{ code: 505, name: "HTTP Version Not Supported", category: "5xx Server Error", description: "The server does not support the HTTP protocol version used in the request." },
	{ code: 511, name: "Network Authentication Required", category: "5xx Server Error", description: "The client needs to authenticate to gain network access." }
];
