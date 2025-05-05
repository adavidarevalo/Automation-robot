provider "aws" {
  region     = var.aws_region
  default_tags {
    tags = var.default_tags
  }
}

module "iam" {
  source = "./modules/iam"
}

module "ec2" {
  source                = "./modules/ec2"
  instance_type         = var.instance_type
  userdata_script_path  = var.userdata_script_path
  ami_id                = var.ami_id
}

module "lambda" {
  source             = "./modules/lambda"
  depends_on         = [module.iam, module.ec2]
  lambda_role        = module.iam.lambda_role_arn
  launch_template_id = module.ec2.launch_template_id
}

module "eventbridge" {
  source          = "./modules/eventbridge"
  schedule_array  = var.schedule_array
  lambda_arn      = module.lambda.lambda_function_arn
  stop_lambda_arn = module.lambda.stop_lambda_function_arn
  timezone        = var.timezone
}
