locals {
  # Create a map of schedules with unique IDs
  schedules = { for idx, schedule in var.schedule_array : 
    "schedule-${idx}" => {
      day  = schedule[0]
      time = schedule[1]
    }
  }
}

# Create EventBridge rules for starting instances
resource "aws_cloudwatch_event_rule" "start_ec2_rule" {
  for_each = local.schedules
  
  name        = "automation-robot-start-${each.key}"
  description = "Start EC2 instance at ${each.value.time} on ${each.value.day}"
  
  # Schedule expression in cron format
  # Convert day of week to number (0=Sunday, 1=Monday, etc.)
  schedule_expression = "cron(${split(":", each.value.time)[1]} ${split(":", each.value.time)[0]} ? * ${substr(each.value.day, 0, 3)} *)"
  event_bus_name     = "default"
  
  tags = {
    Name = "automation-robot-start-${each.key}"
  }
}

# Create EventBridge targets for starting instances
resource "aws_cloudwatch_event_target" "start_ec2_target" {
  for_each = local.schedules
  
  rule      = aws_cloudwatch_event_rule.start_ec2_rule[each.key].name
  target_id = "automation-robot-start-target-${each.key}"
  arn       = var.lambda_arn
}

# Create EventBridge rules for stopping instances
resource "aws_cloudwatch_event_rule" "stop_ec2_rule" {
  for_each = local.schedules
  
  name        = "automation-robot-stop-${each.key}"
  description = "Stop EC2 instance 1 hour and 10 minutes after starting on ${each.value.day}"
  
  # Calculate stop time (1 hour and 10 minutes after start time)
  schedule_expression = "cron(${(tonumber(split(":", each.value.time)[1]) + 10) % 60} ${(tonumber(split(":", each.value.time)[0]) + 1 + (tonumber(split(":", each.value.time)[1]) + 10) / 60) % 24} ? * ${substr(each.value.day, 0, 3)} *)"
  event_bus_name     = "default"
  
  tags = {
    Name = "automation-robot-stop-${each.key}"
  }
}

# Step function to handle passing the instance ID from start to stop Lambda
resource "aws_sfn_state_machine" "ec2_lifecycle" {
  for_each = local.schedules
  
  name     = "automation-robot-lifecycle-${each.key}"
  role_arn = aws_iam_role.step_function_role.arn
  
  definition = <<EOF
{
  "Comment": "State machine to manage EC2 instance lifecycle",
  "StartAt": "StartEC2Instance",
  "States": {
    "StartEC2Instance": {
      "Type": "Task",
      "Resource": "${var.lambda_arn}",
      "Next": "Wait"
    },
    "Wait": {
      "Type": "Wait",
      "Seconds": 4200,
      "Next": "StopEC2Instance"
    },
    "StopEC2Instance": {
      "Type": "Task",
      "Resource": "${var.stop_lambda_arn}",
      "End": true
    }
  }
}
EOF
}

# IAM role for Step Functions
resource "aws_iam_role" "step_function_role" {
  name = "automation-robot-step-function-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "states.amazonaws.com"
        }
      }
    ]
  })
}

# Policy for Step Functions
resource "aws_iam_policy" "step_function_policy" {
  name        = "automation-robot-step-function-policy"
  description = "Policy to allow Step Functions to invoke Lambda"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "lambda:InvokeFunction"
        ]
        Effect   = "Allow"
        Resource = "*"
      }
    ]
  })
}

# Attach policy to role
resource "aws_iam_role_policy_attachment" "step_function_attachment" {
  role       = aws_iam_role.step_function_role.name
  policy_arn = aws_iam_policy.step_function_policy.arn
}

# Set EventBridge targets to trigger Step Functions
resource "aws_cloudwatch_event_target" "step_function_target" {
  for_each = local.schedules
  
  rule      = aws_cloudwatch_event_rule.start_ec2_rule[each.key].name
  target_id = "automation-robot-step-function-target-${each.key}"
  arn       = aws_sfn_state_machine.ec2_lifecycle[each.key].arn
  role_arn  = aws_iam_role.events_role.arn
}

# IAM role for EventBridge to invoke Step Functions
resource "aws_iam_role" "events_role" {
  name = "automation-robot-events-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "events.amazonaws.com"
        }
      }
    ]
  })
}

# Policy for EventBridge
resource "aws_iam_policy" "events_policy" {
  name        = "automation-robot-events-policy"
  description = "Policy to allow EventBridge to start Step Functions"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "states:StartExecution"
        ]
        Effect   = "Allow"
        Resource = "*"
      }
    ]
  })
}

# Attach policy to role
resource "aws_iam_role_policy_attachment" "events_attachment" {
  role       = aws_iam_role.events_role.name
  policy_arn = aws_iam_policy.events_policy.arn
}
