output "lambda_function_arn" {
  description = "ARN of the start EC2 Lambda function"
  value       = aws_lambda_function.start_ec2.arn
}

output "stop_lambda_function_arn" {
  description = "ARN of the stop EC2 Lambda function"
  value       = aws_lambda_function.stop_ec2.arn
}
