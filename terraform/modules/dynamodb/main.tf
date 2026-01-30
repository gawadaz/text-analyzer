terraform {
	required_providers {
		aws = {
			source  = "hashicorp/aws"
			version = ">= 5.0"
		}
	}
}

locals {
	attributes = concat(
		[
			{
				name = var.hash_key
				type = var.hash_key_type
			}
		],
		var.range_key == null ? [] : [
			{
				name = var.range_key
				type = var.range_key_type
			}
		]
	)
}

resource "aws_dynamodb_table" "table" {
	name         = var.table_name
	billing_mode = var.billing_mode
	hash_key     = var.hash_key
	range_key    = var.range_key

	read_capacity  = var.billing_mode == "PROVISIONED" ? var.read_capacity : null
	write_capacity = var.billing_mode == "PROVISIONED" ? var.write_capacity : null

	dynamic "attribute" {
		for_each = local.attributes
		content {
			name = attribute.value.name
			type = attribute.value.type
		}
	}

	tags = var.tags
}