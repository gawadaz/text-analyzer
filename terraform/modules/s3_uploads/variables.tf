variable "bucket_name" {
	type        = string
	description = "Name of the S3 bucket that stores uploads."
}

variable "enable_versioning" {
	type        = bool
	description = "Whether to enable S3 versioning for the uploads bucket."
	default     = true
}

variable "tags" {
	type        = map(string)
	description = "Tags to apply to resources."
	default     = {}
}

variable "cors_allow_origins" {
	type        = list(string)
	description = "Allowed origins for uploads bucket CORS."
}
