output "bucket_name" {
	description = "Name of the uploads bucket."
	value       = aws_s3_bucket.uploads.id
}

output "bucket_arn" {
	description = "ARN of the uploads bucket."
	value       = aws_s3_bucket.uploads.arn
}

output "bucket_region" {
	description = "Region of the uploads bucket."
	value       = aws_s3_bucket.uploads.region
}

output "bucket_regional_domain_name" {
	description = "Regional domain name of the uploads bucket."
	value       = aws_s3_bucket.uploads.bucket_regional_domain_name
}
