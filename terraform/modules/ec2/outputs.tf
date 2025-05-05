output "launch_template_id" {
  description = "ID of the launch template"
  value       = aws_launch_template.automation_template.id
}

output "launch_template_latest_version" {
  description = "Latest version of the launch template"
  value       = aws_launch_template.automation_template.latest_version
}
