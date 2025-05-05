
resource "aws_launch_template" "automation_template" {
  name = "automation-robot-template"
  
  image_id      = var.ami_id
  instance_type = var.instance_type
  key_name      = "automation-key-pair"

  user_data = filebase64(var.userdata_script_path)
  
  network_interfaces {
    associate_public_ip_address = true
    security_groups             = [aws_security_group.automation_sg.id]
  }

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "automation-robot-instance"
    }
  }
}

resource "aws_security_group" "automation_sg" {
  name        = "automation-robot-sg"
  description = "Security group for Automation Robot instances"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "SSH access"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }
}
