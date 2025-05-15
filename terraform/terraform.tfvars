aws_region = "us-west-1"
instance_type = "t3.medium"
key_name = "automation-robot-key"
userdata_script_path = "scripts/ec2-userdata.sh"
timezone = "America/Denver"  # Mountain Time Zone

# Schedule array with days and times to run the automation
schedule_array = [
    ["wednesday", "16:15"],  # 10:15 MT -> 16:15 UTC
    ["thursday", "02:15"],  # 20:15 MT -> 02:15 UTC (Wednesday MT)
    ["thursday", "16:50"],  # 10:40 MT -> 16:40 UTC
    ["friday", "00:00"],   # 18:00 MT -> 00:00 UTC (Thursday MT)
    ["friday", "00:10"],   # 18:10 MT -> 00:10 UTC (Thursday MT)
    ["friday", "02:00"],   # 20:00 MT -> 02:00 UTC (Thursday MT)
    ["friday", "02:15"],   # 20:15 MT -> 02:15 UTC (Thursday MT)
    ["friday", "02:30"]    # 20:30 MT -> 02:30 UTC (Thursday MT)
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
