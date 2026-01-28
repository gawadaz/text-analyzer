output "frontend_bucket_name" {
	description = "Name of the frontend S3 bucket."
	value       = module.s3_frontend.bucket_name
}

output "frontend_bucket_arn" {
	description = "ARN of the frontend S3 bucket."
	value       = module.s3_frontend.bucket_arn
}

output "frontend_bucket_region" {
	description = "Region of the frontend S3 bucket."
	value       = module.s3_frontend.bucket_region
}

output "frontend_bucket_regional_domain_name" {
	description = "Regional domain name of the frontend S3 bucket."
	value       = module.s3_frontend.bucket_regional_domain_name
}

output "cloudfront_distribution_id" {
	description = "ID of the CloudFront distribution."
	value       = module.cloudfront.distribution_id
}

output "cloudfront_distribution_arn" {
	description = "ARN of the CloudFront distribution."
	value       = module.cloudfront.distribution_arn
}

output "cloudfront_domain_name" {
	description = "Domain name of the CloudFront distribution."
	value       = module.cloudfront.distribution_domain_name
}

output "cloudfront_hosted_zone_id" {
	description = "Route53 hosted zone ID for the CloudFront distribution."
	value       = module.cloudfront.distribution_hosted_zone_id
}
