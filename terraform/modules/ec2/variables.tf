variable "instance_type" {
  description = "EC2 instance type"
  type        = string
}

variable "key_name" {
  description = "EC2 key pair name"
  type        = string
}

variable "userdata_script_path" {
  description = "Path to userdata script"
  type        = string
}
