variable "schedule_array" {
  description = "Array of days and times to run the automation"
  type        = list(list(string))
}

variable "lambda_arn" {
  description = "ARN of the start EC2 Lambda function"
  type        = string
}

variable "stop_lambda_arn" {
  description = "ARN of the stop EC2 Lambda function"
  type        = string
  default     = ""
}

variable "timezone" {
  description = "Timezone for the schedules"
  type        = string
}
