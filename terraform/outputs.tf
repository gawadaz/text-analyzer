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

output "uploads_bucket_name" {
	description = "Name of the uploads S3 bucket."
	value       = module.s3_uploads.bucket_name
}

output "uploads_bucket_arn" {
	description = "ARN of the uploads S3 bucket."
	value       = module.s3_uploads.bucket_arn
}

output "uploads_bucket_region" {
	description = "Region of the uploads S3 bucket."
	value       = module.s3_uploads.bucket_region
}

output "uploads_bucket_regional_domain_name" {
	description = "Regional domain name of the uploads S3 bucket."
	value       = module.s3_uploads.bucket_regional_domain_name
}

output "dynamodb_table_name" {
	description = "Name of the DynamoDB table."
	value       = module.dynamodb.table_name
}

output "dynamodb_table_arn" {
	description = "ARN of the DynamoDB table."
	value       = module.dynamodb.table_arn
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

output "api_gateway_id" {
	description = "ID of the API Gateway HTTP API."
	value       = module.apigw_http.api_id
}

output "api_gateway_endpoint" {
	description = "Base endpoint URL for the API Gateway HTTP API."
	value       = module.apigw_http.api_endpoint
}
