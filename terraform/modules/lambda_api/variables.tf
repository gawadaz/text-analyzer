variable "function_name" {
	type        = string
	description = "Name of the Lambda function."
}

variable "description" {
	type        = string
	description = "Description for the Lambda function."
	default     = "Uploads presign Lambda"
}

variable "handler" {
	type        = string
	description = "Handler for the Lambda function."
}

variable "runtime" {
	type        = string
	description = "Runtime for the Lambda function."
	default     = "nodejs20.x"
}

variable "package_path" {
	type        = string
	description = "Path to the Lambda deployment package zip."
}

variable "memory_size" {
	type        = number
	description = "Memory size in MB for the Lambda function."
	default     = 256
}

variable "timeout" {
	type        = number
	description = "Timeout in seconds for the Lambda function."
	default     = 10
}

variable "log_retention_in_days" {
	type        = number
	description = "Retention in days for CloudWatch logs."
	default     = 14
}

variable "uploads_bucket_name" {
	type        = string
	description = "S3 bucket name where uploads will be stored."
}

variable "dynamodb_table_name" {
	type        = string
	description = "DynamoDB table name used by the Lambda function."
}

variable "dynamodb_table_arn" {
	type        = string
	description = "DynamoDB table ARN used by the Lambda function."
}

variable "environment_variables" {
	type        = map(string)
	description = "Additional environment variables for the Lambda function."
	default     = {}
}

variable "tags" {
	type        = map(string)
	description = "Tags to apply to resources."
	default     = {}
}
