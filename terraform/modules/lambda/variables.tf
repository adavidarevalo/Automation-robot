variable "lambda_role" {
  description = "ARN of the IAM role for Lambda functions"
  type        = string
}

variable "launch_template_id" {
  description = "ID of the EC2 launch template"
  type        = string
  default     = ""
}
