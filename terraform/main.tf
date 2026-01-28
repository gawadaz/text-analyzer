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
