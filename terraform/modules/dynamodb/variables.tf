variable "table_name" {
	type        = string
	description = "Name of the DynamoDB table."
}

variable "hash_key" {
	type        = string
	description = "Partition key attribute name."
}

variable "hash_key_type" {
	type        = string
	description = "Partition key attribute type (S, N, B)."
	default     = "S"
}

variable "range_key" {
	type        = string
	description = "Sort key attribute name (optional)."
	default     = null
}

variable "range_key_type" {
	type        = string
	description = "Sort key attribute type (S, N, B)."
	default     = "S"
}

variable "billing_mode" {
	type        = string
	description = "Billing mode for the table (PAY_PER_REQUEST or PROVISIONED)."
	default     = "PAY_PER_REQUEST"
}

variable "read_capacity" {
	type        = number
	description = "Read capacity units (used only when billing_mode is PROVISIONED)."
	default     = 5
}

variable "write_capacity" {
	type        = number
	description = "Write capacity units (used only when billing_mode is PROVISIONED)."
	default     = 5
}

variable "tags" {
	type        = map(string)
	description = "Tags to apply to resources."
	default     = {}
}