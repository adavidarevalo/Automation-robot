variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-west-1"
}

variable "default_tags" {
  description = "Default tags for all resources"
  type        = map(string)
  default = {
    Environment = "dev"
    Project     = "Automation-robot"
    ManagedBy   = "Terraform"
  }
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.medium"
}

variable "key_name" {
  description = "EC2 key pair name"
  type        = string
  default     = "automation-robot-key"
}

variable "userdata_script_path" {
  description = "Path to userdata script"
  type        = string
  default     = "scripts/ec2-userdata.sh"
}

variable "schedule_array" {
  description = "Array of days and times to run the automation in Mountain Time Zone"
  type        = list(list(string))
  default = [
    ["wednesday", "16:15"],
    ["wednesday", "02:15"],
    ["wednesday", "22:00"],
    ["thursday", "00:00"],
    ["thursday", "00:10"],
    ["thursday", "02:15"],
    ["thursday", "02:25"]
  ]
}

variable "timezone" {
  description = "Timezone for the schedules"
  type        = string
  default     = "America/Denver" # Mountain Time Zone (Provo, Utah)
}

variable "ami_id" {
  description = "The ID of the AMI to use for the EC2 instance"
  type        = string
  default     = "ami-04f7a54071e74f488"
}
