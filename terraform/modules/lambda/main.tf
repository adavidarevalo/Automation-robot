resource "aws_lambda_function" "start_ec2" {
  function_name = "automation-robot-start-ec2"
  role          = var.lambda_role
  handler       = "index.startInstance"
  runtime       = "nodejs16.x"
  timeout       = 30
  
  filename      = data.archive_file.lambda_code.output_path
  source_code_hash = data.archive_file.lambda_code.output_base64sha256
  
  environment {
    variables = {
      LAUNCH_TEMPLATE_ID = var.launch_template_id
    }
  }
}

resource "aws_lambda_function" "stop_ec2" {
  function_name = "automation-robot-stop-ec2"
  role          = var.lambda_role
  handler       = "index.terminateInstance"
  runtime       = "nodejs16.x"
  timeout       = 30
  
  filename      = data.archive_file.lambda_code.output_path
  source_code_hash = data.archive_file.lambda_code.output_base64sha256
}

data "archive_file" "lambda_code" {
  type        = "zip"
  output_path = "${path.module}/lambda_function.zip"
  
  source {
    content  = <<-EOT
      exports.startInstance = async (event) => {
        const AWS = require('aws-sdk');
        const ec2 = new AWS.EC2();
        
        console.log('Starting EC2 instance');
        
        // Get launch template ID from environment variable
        const launchTemplateId = process.env.LAUNCH_TEMPLATE_ID || '';
        
        if (!launchTemplateId) {
          throw new Error('Launch template ID not provided');
        }
        
        try {
          // Launch a new instance using the template
          const params = {
            LaunchTemplate: {
              LaunchTemplateId: launchTemplateId
            },
            MaxCount: 1,
            MinCount: 1
          };
          
          const result = await ec2.runInstances(params).promise();
          
          const instanceId = result.Instances[0].InstanceId;
          console.log(`Successfully started instance: $${instanceId}`);
          
          // Add instance ID to event for use by subsequent rules
          return {
            ...event,
            instanceId: instanceId
          };
        } catch (error) {
          console.error('Error starting instance:', error);
          throw error;
        }
      };
      
      exports.terminateInstance = async (event) => {
        const AWS = require('aws-sdk');
        const ec2 = new AWS.EC2();
        
        console.log('Terminating EC2 instance');
        
        // Get instance ID from the event
        const instanceId = event.instanceId;
        
        if (!instanceId) {
          throw new Error('Instance ID not provided in event');
        }
        
        try {
          // Terminate the instance
          const params = {
            InstanceIds: [instanceId]
          };
          
          await ec2.terminateInstances(params).promise();
          
          console.log(`Successfully terminated instance: $${instanceId}`);
          return {
            statusCode: 200,
            body: JSON.stringify(`Instance $${instanceId} terminated successfully`)
          };
        } catch (error) {
          console.error('Error terminating instance:', error);
          throw error;
        }
      };
    EOT
    filename = "index.js"
  }
}
