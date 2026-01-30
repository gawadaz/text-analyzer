output "api_id" {
	description = "ID of the API Gateway HTTP API."
	value       = aws_apigatewayv2_api.this.id
}

output "api_endpoint" {
	description = "Base endpoint URL for the API Gateway."
	value       = aws_apigatewayv2_api.this.api_endpoint
}

output "execution_arn" {
	description = "Execution ARN for the API Gateway."
	value       = aws_apigatewayv2_api.this.execution_arn
}

output "stage_name" {
	description = "Stage name for the API Gateway."
	value       = aws_apigatewayv2_stage.default.name
}
