aws_region = "us-west-1"
instance_type = "t3.medium"
key_name = "automation-robot-key"
userdata_script_path = "scripts/ec2-userdata.sh"
timezone = "America/Denver"  # Mountain Time Zone

# Schedule array with days and times to run the automation
schedule_array = [
  ["Wednesday", "10:20"],
  ["Thursday", "10:20"]
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
