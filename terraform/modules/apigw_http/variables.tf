variable "api_name" {
	type        = string
	description = "Name of the API Gateway HTTP API."
}

variable "route_key" {
	type        = string
	description = "Route key for the API Gateway route, e.g. 'POST /path'."
}

variable "lambda_invoke_arn" {
	type        = string
	description = "Invoke ARN for the Lambda integration."
}

variable "lambda_function_name" {
	type        = string
	description = "Lambda function name for permission binding."
}

variable "stage_name" {
	type        = string
	description = "Stage name for the API Gateway. Use '$default' for default stage."
	default     = "$default"
}

variable "cors_allow_origins" {
	type        = list(string)
	description = "Allowed origins for CORS."
}

variable "cors_allow_methods" {
	type        = list(string)
	description = "Allowed methods for CORS."
	default     = ["POST", "OPTIONS"]
}

variable "cors_allow_headers" {
	type        = list(string)
	description = "Allowed headers for CORS."
	default     = [
		"Content-Type",
		"Authorization",
		"X-Amz-Date",
		"X-Api-Key",
		"X-Amz-Security-Token",
		"X-Amz-User-Agent"
	]
}

variable "cors_allow_credentials" {
	type        = bool
	description = "Whether CORS allows credentials."
	default     = false
}

variable "cors_max_age" {
	type        = number
	description = "CORS max age in seconds."
	default     = 3600
}

variable "tags" {
	type        = map(string)
	description = "Tags to apply to resources."
	default     = {}
}
