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
