aws_region  = "us-east-1"
aws_profile = "terraform-user"

frontend_bucket_name              = "text-analyzer-ui"
frontend_bucket_enable_versioning = true

tags = {
  Environment = "dev"
  Project     = "text-analyzer"
}
