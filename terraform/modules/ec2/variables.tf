variable "instance_type" {
  description = "EC2 instance type"
  type        = string
}

variable "userdata_script_path" {
  description = "Path to userdata script"
  type        = string
}

variable "ami_id" {
  description = "The ID of the AMI to use for the EC2 instance"
  type        = string
}
