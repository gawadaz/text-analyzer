terraform {
	required_providers {
		aws = {
			source  = "hashicorp/aws"
			version = ">= 5.0"
		}
	}
}

data "aws_iam_policy_document" "lambda_assume" {
	statement {
		effect  = "Allow"
		actions = ["sts:AssumeRole"]

		principals {
			type        = "Service"
			identifiers = ["lambda.amazonaws.com"]
		}
	}
}

resource "aws_iam_role" "lambda" {
	name               = "${var.function_name}-role"
	assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
	tags               = var.tags
}

resource "aws_iam_role_policy_attachment" "basic_execution" {
	role       = aws_iam_role.lambda.name
	policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

data "aws_iam_policy_document" "uploads_put" {
	statement {
		effect  = "Allow"
		actions = var.uploads_bucket_actions
		resources = ["arn:aws:s3:::${var.uploads_bucket_name}/*"]
	}
}

data "aws_iam_policy_document" "dynamodb_rw" {
	statement {
		effect = "Allow"
		actions = [
			"dynamodb:BatchGetItem",
			"dynamodb:BatchWriteItem",
			"dynamodb:DeleteItem",
			"dynamodb:GetItem",
			"dynamodb:PutItem",
			"dynamodb:Query",
			"dynamodb:Scan",
			"dynamodb:UpdateItem"
		]
		resources = [
			var.dynamodb_table_arn,
			"${var.dynamodb_table_arn}/index/*"
		]
	}
}

resource "aws_iam_role_policy" "uploads_put" {
	name   = "${var.function_name}-uploads-put"
	role   = aws_iam_role.lambda.id
	policy = data.aws_iam_policy_document.uploads_put.json
}

resource "aws_iam_role_policy" "dynamodb_rw" {
	name   = "${var.function_name}-dynamodb-rw"
	role   = aws_iam_role.lambda.id
	policy = data.aws_iam_policy_document.dynamodb_rw.json
}

resource "aws_cloudwatch_log_group" "lambda" {
	name              = "/aws/lambda/${var.function_name}"
	retention_in_days = var.log_retention_in_days
	tags              = var.tags
}

resource "aws_lambda_function" "lambda" {
	function_name = var.function_name
	description   = var.description
	handler       = var.handler
	runtime       = var.runtime
	role          = aws_iam_role.lambda.arn
	filename      = var.package_path
	source_code_hash = filebase64sha256(var.package_path)
	memory_size   = var.memory_size
	timeout       = var.timeout
	tags          = var.tags

	environment {
		variables = merge(
			{
				UPLOAD_BUCKET_NAME = var.uploads_bucket_name
				DYNAMODB_TABLE_NAME = var.dynamodb_table_name
			},
			var.environment_variables
		)
	}

	depends_on = [aws_cloudwatch_log_group.lambda]
}
