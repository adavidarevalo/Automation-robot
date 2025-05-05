resource "aws_key_pair" "automation_key" {
  key_name   = var.key_name
  public_key = tls_private_key.automation_key.public_key_openssh
}

resource "tls_private_key" "automation_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "local_file" "private_key" {
  content         = tls_private_key.automation_key.private_key_pem
  filename        = "${path.root}/automation-robot-key.pem"
  file_permission = "0600"
}

data "aws_ami" "ubuntu" {
  most_recent = true

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  filter {
    name   = "root-device-type"
    values = ["ebs"]
  }
}

resource "aws_launch_template" "automation_template" {
  name = "automation-robot-template"
  
  image_id      = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
  key_name      = aws_key_pair.automation_key.key_name

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
