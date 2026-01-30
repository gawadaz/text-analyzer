aws_region  = "us-east-1"
aws_profile = "terraform-user"

frontend_bucket_name              = "text-analyzer-ui"
frontend_bucket_enable_versioning = true

uploads_bucket_name              = "text-analyzer-uploads"
uploads_bucket_enable_versioning = true

dynamodb_table_name = "text-analyzer-history"
dynamodb_hash_key   = "PK"
dynamodb_range_key  = "SK"

api_lambda_handler      = "main.presignHandler"
api_lambda_package_path = "../apps/text-analyzer-api/dist/lambda.zip"

analytics_lambda_handler      = "main.analyticsHandler"
analytics_lambda_package_path = "../apps/text-analyzer-api/dist/lambda.zip"

analytics_delete_lambda_handler      = "main.analyticsDeleteHandler"
analytics_delete_lambda_package_path = "../apps/text-analyzer-api/dist/lambda.zip"

worker_lambda_handler      = "main.workerHandler"
worker_lambda_package_path = "../apps/text-analyzer-api/dist/lambda.zip"

api_cors_allow_origins = [
  "http://localhost:4200",
  "https://d3q4trucsrrapt.cloudfront.net"
]

uploads_cors_allow_origins = [
  "http://localhost:4200",
  "https://d3q4trucsrrapt.cloudfront.net"
]

tags = {
  Environment = "dev"
  Project     = "text-analyzer"
}
