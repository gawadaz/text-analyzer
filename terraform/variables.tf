variable "aws_region" {
	type        = string
	description = "AWS region for all resources."
	default     = "us-east-1"
}

variable "aws_profile" {
	type        = string
	description = "AWS CLI profile name to use for credentials."
}

variable "frontend_bucket_name" {
	type        = string
	description = "Name of the S3 bucket that hosts the frontend assets."
}

variable "frontend_bucket_enable_versioning" {
	type        = bool
	description = "Whether to enable S3 versioning for the frontend bucket."
	default     = true
}

variable "tags" {
	type        = map(string)
	description = "Tags to apply to resources."
	default     = {}
}

variable "uploads_bucket_name" {
	type        = string
	description = "S3 bucket name for user uploads."
}

variable "uploads_bucket_enable_versioning" {
	type        = bool
	description = "Whether to enable S3 versioning for the uploads bucket."
	default     = true
}

variable "uploads_cors_allow_origins" {
	type        = list(string)
	description = "Allowed origins for uploads bucket CORS configuration."
}

variable "dynamodb_table_name" {
	type        = string
	description = "Name of the DynamoDB table used by the API."
}

variable "dynamodb_hash_key" {
	type        = string
	description = "Partition key attribute name for the DynamoDB table."
}

variable "dynamodb_hash_key_type" {
	type        = string
	description = "Partition key attribute type (S, N, B)."
	default     = "S"
}

variable "dynamodb_range_key" {
	type        = string
	description = "Sort key attribute name for the DynamoDB table (optional)."
	default     = null
}

variable "dynamodb_range_key_type" {
	type        = string
	description = "Sort key attribute type (S, N, B)."
	default     = "S"
}

variable "dynamodb_billing_mode" {
	type        = string
	description = "Billing mode for the DynamoDB table."
	default     = "PAY_PER_REQUEST"
}

variable "dynamodb_read_capacity" {
	type        = number
	description = "Read capacity units (only used if billing_mode is PROVISIONED)."
	default     = 5
}

variable "dynamodb_write_capacity" {
	type        = number
	description = "Write capacity units (only used if billing_mode is PROVISIONED)."
	default     = 5
}

variable "api_lambda_function_name" {
	type        = string
	description = "Name of the uploads presign Lambda function."
	default     = "text-analyzer-uploads-presign"
}

variable "api_lambda_handler" {
	type        = string
	description = "Handler for the uploads presign Lambda function."
}

variable "api_lambda_runtime" {
	type        = string
	description = "Runtime for the uploads presign Lambda function."
	default     = "nodejs20.x"
}

variable "api_lambda_package_path" {
	type        = string
	description = "Path to the Lambda deployment package zip for uploads presign."
}

variable "api_lambda_memory_size" {
	type        = number
	description = "Memory size for the uploads presign Lambda function."
	default     = 256
}

variable "api_lambda_timeout" {
	type        = number
	description = "Timeout for the uploads presign Lambda function."
	default     = 10
}

variable "api_lambda_log_retention_in_days" {
	type        = number
	description = "CloudWatch log retention in days for the uploads presign Lambda function."
	default     = 14
}

variable "analytics_lambda_function_name" {
	type        = string
	description = "Name of the analytics Lambda function."
	default     = "text-analyzer-analytics"
}

variable "analytics_lambda_handler" {
	type        = string
	description = "Handler for the analytics Lambda function."
}

variable "analytics_lambda_runtime" {
	type        = string
	description = "Runtime for the analytics Lambda function."
	default     = "nodejs20.x"
}

variable "analytics_lambda_package_path" {
	type        = string
	description = "Path to the Lambda deployment package zip for analytics."
}

variable "analytics_lambda_memory_size" {
	type        = number
	description = "Memory size for the analytics Lambda function."
	default     = 256
}

variable "analytics_lambda_timeout" {
	type        = number
	description = "Timeout for the analytics Lambda function."
	default     = 10
}

variable "analytics_lambda_log_retention_in_days" {
	type        = number
	description = "CloudWatch log retention in days for the analytics Lambda function."
	default     = 14
}

variable "analytics_delete_lambda_function_name" {
	type        = string
	description = "Name of the analytics delete Lambda function."
	default     = "text-analyzer-analytics-delete"
}

variable "analytics_delete_lambda_handler" {
	type        = string
	description = "Handler for the analytics delete Lambda function."
}

variable "analytics_delete_lambda_runtime" {
	type        = string
	description = "Runtime for the analytics delete Lambda function."
	default     = "nodejs20.x"
}

variable "analytics_delete_lambda_package_path" {
	type        = string
	description = "Path to the Lambda deployment package zip for analytics delete."
}

variable "analytics_delete_lambda_memory_size" {
	type        = number
	description = "Memory size for the analytics delete Lambda function."
	default     = 256
}

variable "analytics_delete_lambda_timeout" {
	type        = number
	description = "Timeout for the analytics delete Lambda function."
	default     = 10
}

variable "analytics_delete_lambda_log_retention_in_days" {
	type        = number
	description = "CloudWatch log retention in days for the analytics delete Lambda function."
	default     = 14
}

variable "worker_lambda_function_name" {
	type        = string
	description = "Name of the S3 worker Lambda function."
	default     = "text-analyzer-worker"
}

variable "worker_lambda_handler" {
	type        = string
	description = "Handler for the S3 worker Lambda function."
}

variable "worker_lambda_runtime" {
	type        = string
	description = "Runtime for the S3 worker Lambda function."
	default     = "nodejs20.x"
}

variable "worker_lambda_package_path" {
	type        = string
	description = "Path to the Lambda deployment package zip for the S3 worker."
}

variable "worker_lambda_memory_size" {
	type        = number
	description = "Memory size for the S3 worker Lambda function."
	default     = 256
}

variable "worker_lambda_timeout" {
	type        = number
	description = "Timeout for the S3 worker Lambda function."
	default     = 30
}

variable "worker_lambda_log_retention_in_days" {
	type        = number
	description = "CloudWatch log retention in days for the S3 worker Lambda function."
	default     = 14
}

variable "api_gateway_name" {
	type        = string
	description = "Name of the API Gateway HTTP API."
	default     = "text-analyzer-api"
}

variable "api_cors_allow_origins" {
	type        = list(string)
	description = "Allowed origins for the API Gateway CORS configuration."
	default     = ["*"]
}
