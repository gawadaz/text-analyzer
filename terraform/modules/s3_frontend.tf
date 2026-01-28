terraform {
	required_providers {
		aws = {
			source  = "hashicorp/aws"
			version = ">= 5.0"
		}
	}
}

variable "bucket_name" {
	type        = string
	description = "Name of the S3 bucket that hosts the frontend assets."
}

variable "enable_versioning" {
	type        = bool
	description = "Whether to enable S3 versioning for the frontend bucket."
	default     = true
}

variable "tags" {
	type        = map(string)
	description = "Tags to apply to resources."
	default     = {}
}

resource "aws_s3_bucket" "frontend" {
	bucket = var.bucket_name
	tags   = var.tags
}

resource "aws_s3_bucket_ownership_controls" "frontend" {
	bucket = aws_s3_bucket.frontend.id

	rule {
		object_ownership = "BucketOwnerEnforced"
	}
}

resource "aws_s3_bucket_public_access_block" "frontend" {
	bucket = aws_s3_bucket.frontend.id

	block_public_acls       = true
	block_public_policy     = true
	ignore_public_acls      = true
	restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "frontend" {
	bucket = aws_s3_bucket.frontend.id

	rule {
		apply_server_side_encryption_by_default {
			sse_algorithm = "AES256"
		}
	}
}

resource "aws_s3_bucket_versioning" "frontend" {
	bucket = aws_s3_bucket.frontend.id

	versioning_configuration {
		status = var.enable_versioning ? "Enabled" : "Suspended"
	}
}

output "bucket_name" {
	description = "Name of the frontend bucket."
	value       = aws_s3_bucket.frontend.id
}

output "bucket_arn" {
	description = "ARN of the frontend bucket."
	value       = aws_s3_bucket.frontend.arn
}

output "bucket_region" {
	description = "Region of the frontend bucket."
	value       = aws_s3_bucket.frontend.region
}

output "bucket_regional_domain_name" {
	description = "Regional domain name of the frontend bucket."
	value       = aws_s3_bucket.frontend.bucket_regional_domain_name
}
