terraform {
	required_providers {
		aws = {
			source  = "hashicorp/aws"
			version = ">= 5.0"
		}
	}
}

resource "aws_apigatewayv2_api" "this" {
	name          = var.api_name
	protocol_type = "HTTP"
	tags          = var.tags

	cors_configuration {
		allow_origins     = var.cors_allow_origins
		allow_methods     = var.cors_allow_methods
		allow_headers     = var.cors_allow_headers
		allow_credentials = var.cors_allow_credentials
		max_age           = var.cors_max_age
	}
}

locals {
	route_map    = { for route in var.routes : route.route_key => route }
	function_map = { for route in var.routes : route.lambda_function_name => route.lambda_function_name }
}

resource "aws_apigatewayv2_integration" "lambda" {
	for_each               = local.route_map
	api_id                 = aws_apigatewayv2_api.this.id
	integration_type       = "AWS_PROXY"
	integration_uri        = each.value.lambda_invoke_arn
	payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "routes" {
	for_each  = aws_apigatewayv2_integration.lambda
	api_id    = aws_apigatewayv2_api.this.id
	route_key = each.key
	target    = "integrations/${each.value.id}"
}

resource "aws_apigatewayv2_stage" "default" {
	api_id      = aws_apigatewayv2_api.this.id
	name        = var.stage_name
	auto_deploy = true
	tags        = var.tags
}

resource "aws_lambda_permission" "apigw_invoke" {
	for_each      = local.function_map
	statement_id  = "AllowExecutionFromApiGateway-${each.key}"
	action        = "lambda:InvokeFunction"
	function_name = each.value
	principal     = "apigateway.amazonaws.com"
	source_arn    = "${aws_apigatewayv2_api.this.execution_arn}/*/*"
}
