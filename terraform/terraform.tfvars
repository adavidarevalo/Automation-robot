aws_region = "us-west-1"
instance_type = "t3.medium"
key_name = "automation-robot-key"
userdata_script_path = "scripts/ec2-userdata.sh"
timezone = "America/Denver"  # Mountain Time Zone

# Schedule array with days and times to run the automation
schedule_array = [
    ["wednesday", "16:10"],  # 16:15 - 5min = 16:10 UTC
    ["thursday", "02:10"],  # 02:15 - 5min = 02:10 UTC
    ["thursday", "17:20"],  # 17:15 - 5min = 17:10 UTC
    ["thursday", "23:55"],  # 00:00 - 5min = 23:55 UTC (day changes)
    ["friday", "00:05"],   # 00:10 - 5min = 00:05 UTC
    ["friday", "01:55"],   # 02:00 - 5min = 01:55 UTC
    ["friday", "02:10"],   # 02:15 - 5min = 02:10 UTC
    ["friday", "02:25"]    # 02:30 - 5min = 02:25 UTC
]

# Default tags to apply to all resources
default_tags = {
  Environment = "dev"
  Project     = "Automation-robot"
  ManagedBy   = "Terraform"
  Owner       = "DevOps"
}

# AMI ID for EC2 instance
ami_id = "ami-04f7a54071e74f488"
