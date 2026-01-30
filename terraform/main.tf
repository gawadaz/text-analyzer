terraform {
	required_version = ">= 1.5.0"

	required_providers {
		aws = {
			source  = "hashicorp/aws"
			version = ">= 5.0"
		}
	}
}

provider "aws" {
	region  = var.aws_region	
	profile = var.aws_profile
}

module "cloudfront" {
	source = "./modules/cloudfront"

	origin_bucket_name                 = module.s3_frontend.bucket_name
	origin_bucket_regional_domain_name = module.s3_frontend.bucket_regional_domain_name
	tags                               = var.tags
}

module "s3_frontend" {
	source = "./modules/s3_frontend"

	bucket_name                 = var.frontend_bucket_name
	enable_versioning           = var.frontend_bucket_enable_versioning
	tags                        = var.tags
}

module "s3_uploads" {
	source = "./modules/s3_uploads"

	bucket_name       = var.uploads_bucket_name
	enable_versioning = var.uploads_bucket_enable_versioning
	cors_allow_origins = var.uploads_cors_allow_origins
	tags              = var.tags
}

module "dynamodb" {
	source = "./modules/dynamodb"

	table_name     = var.dynamodb_table_name
	hash_key       = var.dynamodb_hash_key
	hash_key_type  = var.dynamodb_hash_key_type
	range_key      = var.dynamodb_range_key
	range_key_type = var.dynamodb_range_key_type
	billing_mode   = var.dynamodb_billing_mode
	read_capacity  = var.dynamodb_read_capacity
	write_capacity = var.dynamodb_write_capacity
	tags           = var.tags
}

module "lambda_api" {
	source = "./modules/lambda_api"

	function_name           = var.api_lambda_function_name
	description             = "Uploads presign handler"
	handler                 = var.api_lambda_handler
	runtime                 = var.api_lambda_runtime
	package_path            = var.api_lambda_package_path
	memory_size             = var.api_lambda_memory_size
	timeout                 = var.api_lambda_timeout
	log_retention_in_days   = var.api_lambda_log_retention_in_days
	uploads_bucket_name     = module.s3_uploads.bucket_name
	dynamodb_table_name     = module.dynamodb.table_name
	dynamodb_table_arn       = module.dynamodb.table_arn
	environment_variables = {}
	tags = var.tags
}

module "apigw_http" {
	source = "./modules/apigw_http"

	api_name             = var.api_gateway_name
	route_key            = "POST /api/v1/uploads/presign"
	lambda_invoke_arn     = module.lambda_api.invoke_arn
	lambda_function_name  = module.lambda_api.function_name
	cors_allow_origins    = var.api_cors_allow_origins
	tags                  = var.tags
}

data "aws_iam_policy_document" "frontend_cloudfront_read" {
	statement {
		sid     = "AllowCloudFrontRead"
		effect  = "Allow"
		actions = ["s3:GetObject"]

		resources = ["${module.s3_frontend.bucket_arn}/*"]

		principals {
			type        = "Service"
			identifiers = ["cloudfront.amazonaws.com"]
		}

		condition {
			test     = "StringEquals"
			variable = "AWS:SourceArn"
			values   = [module.cloudfront.distribution_arn]
		}
	}
}

resource "aws_s3_bucket_policy" "frontend" {
	bucket = module.s3_frontend.bucket_name
	policy = data.aws_iam_policy_document.frontend_cloudfront_read.json
}
