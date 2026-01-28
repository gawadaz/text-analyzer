terraform {
	required_providers {
		aws = {
			source  = "hashicorp/aws"
			version = ">= 5.0"
		}
	}
}

variable "origin_bucket_name" {
	type        = string
	description = "Name of the S3 bucket that hosts the frontend assets."
}

variable "origin_bucket_regional_domain_name" {
	type        = string
	description = "Regional domain name of the S3 bucket used as the origin."
}

variable "default_root_object" {
	type        = string
	description = "Default root object for the distribution."
	default     = "index.html"
}

variable "price_class" {
	type        = string
	description = "CloudFront price class."
	default     = "PriceClass_100"
}

variable "enabled" {
	type        = bool
	description = "Whether the distribution is enabled."
	default     = true
}

variable "http_version" {
	type        = string
	description = "HTTP version to support."
	default     = "http2and3"
}

variable "comment" {
	type        = string
	description = "Comment for the distribution."
	default     = "Frontend distribution"
}

variable "aliases" {
	type        = list(string)
	description = "Alternate domain names (CNAMEs)."
	default     = []
}

variable "acm_certificate_arn" {
	type        = string
	description = "ACM certificate ARN for custom domain aliases."
	default     = null

	validation {
		condition     = length(var.aliases) == 0 || var.acm_certificate_arn != null
		error_message = "When aliases are provided, acm_certificate_arn must be set."
	}
}

variable "minimum_protocol_version" {
	type        = string
	description = "Minimum TLS protocol version for viewers when using ACM cert."
	default     = "TLSv1.2_2021"
}

variable "tags" {
	type        = map(string)
	description = "Tags to apply to resources."
	default     = {}
}

data "aws_cloudfront_cache_policy" "caching_optimized" {
	name = "Managed-CachingOptimized"
}

data "aws_cloudfront_origin_request_policy" "cors_s3" {
	name = "Managed-CORS-S3Origin"
}

data "aws_cloudfront_response_headers_policy" "security_headers" {
	name = "Managed-SecurityHeadersPolicy"
}

resource "aws_cloudfront_origin_access_control" "frontend" {
	name                              = "${var.origin_bucket_name}-oac"
	description                       = "OAC for ${var.origin_bucket_name}"
	origin_access_control_origin_type = "s3"
	signing_behavior                  = "always"
	signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "frontend" {
	enabled             = var.enabled
	is_ipv6_enabled     = true
	comment             = var.comment
	default_root_object = var.default_root_object
	price_class         = var.price_class
	http_version        = var.http_version
	aliases             = var.aliases
	tags                = var.tags

	origin {
		domain_name              = var.origin_bucket_regional_domain_name
		origin_id                = "s3-${var.origin_bucket_name}"
		origin_access_control_id = aws_cloudfront_origin_access_control.frontend.id
	}

	default_cache_behavior {
		target_origin_id       = "s3-${var.origin_bucket_name}"
		viewer_protocol_policy = "redirect-to-https"
		allowed_methods        = ["GET", "HEAD", "OPTIONS"]
		cached_methods         = ["GET", "HEAD", "OPTIONS"]
		compress               = true

		cache_policy_id            = data.aws_cloudfront_cache_policy.caching_optimized.id
		origin_request_policy_id   = data.aws_cloudfront_origin_request_policy.cors_s3.id
		response_headers_policy_id = data.aws_cloudfront_response_headers_policy.security_headers.id
	}

	restrictions {
		geo_restriction {
			restriction_type = "none"
		}
	}

	viewer_certificate {
		cloudfront_default_certificate = var.acm_certificate_arn == null
		acm_certificate_arn            = var.acm_certificate_arn
		ssl_support_method             = var.acm_certificate_arn == null ? null : "sni-only"
		minimum_protocol_version       = var.acm_certificate_arn == null ? null : var.minimum_protocol_version
	}

	custom_error_response {
		error_code            = 403
		response_code         = 200
		response_page_path    = "/index.html"
		error_caching_min_ttl = 0
	}

	custom_error_response {
		error_code            = 404
		response_code         = 200
		response_page_path    = "/index.html"
		error_caching_min_ttl = 0
	}
}

output "distribution_id" {
	description = "ID of the CloudFront distribution."
	value       = aws_cloudfront_distribution.frontend.id
}

output "distribution_arn" {
	description = "ARN of the CloudFront distribution."
	value       = aws_cloudfront_distribution.frontend.arn
}

output "distribution_domain_name" {
	description = "Domain name of the CloudFront distribution."
	value       = aws_cloudfront_distribution.frontend.domain_name
}

output "distribution_hosted_zone_id" {
	description = "Route53 hosted zone ID for the CloudFront distribution."
	value       = aws_cloudfront_distribution.frontend.hosted_zone_id
}

output "origin_access_control_id" {
	description = "ID of the CloudFront origin access control."
	value       = aws_cloudfront_origin_access_control.frontend.id
}
