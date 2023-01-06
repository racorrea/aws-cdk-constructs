import * as cdk from 'aws-cdk-lib';
import { SecurityPolicy } from 'aws-cdk-lib/aws-apigateway';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { Effect, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { LambdaApiRestConstruct } from '../constructs/lambda/LambdaApiRestConstruct';
import { LambdaConstruct } from '../constructs/lambda/LambdaConstruct';
import { handler } from '../src/handler/HelloWorldHandler';
import { StackVariables } from './buildConfig';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

const LAMBDA_CODE_PATH = '../../src/handler';


export class Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id);
    
    let certificateArn = '';
    process.env?.CERTIFICATE_ARN ? certificateArn = process.env?.CERTIFICATE_ARN  : certificateArn = '';
    // certificateArn = 'arn:aws:acm:us-east-1:756557892660:certificate/c06eb407-fd27-49a6-876d-b5b3abe4ea41';

    const recordName = `api.${process.env.DOMAIN_NAME}`;
    const certificate = Certificate.fromCertificateArn(this, `${props?.stackName}-certificate-${process.env.ENV}`, certificateArn);

    //Create rol
    const iamRole = new Role(this, `${props?.stackName}-role-${process.env.ENV}`,{
      roleName: `${props?.stackName}-role-${process.env.ENV}`,
      assumedBy: new ServicePrincipal('lambda.amazonaws.com')
    });

    //Implement Lambda without api
    const helloWorldLambda = new LambdaConstruct(this, `${props?.stackName}-lambda-${process.env.ENV}`).createLambdaFunction({
      functionName: `${props?.stackName}-lambda-${process.env.ENV}`,
      handler: 'HelloWorldHandler.handler',
      codePath: LAMBDA_CODE_PATH,
      role: iamRole,
    });


    // const helloWorldLambda = new LambdaConstruct(this, `${props?.stackName}-lambda-${process.env.ENV}`, {
    //   functionName: `${props?.stackName}-lambda-${process.env.ENV}`,
    //   handler: 'HelloWorldHandler.handler',
    //   codePath: LAMBDA_CODE_PATH,
    //   role: iamRole,
    // });

    
    // Todo: test with pathParam ex.: 'GET /hello/{name}'
    const helloWorldApiRest = new LambdaApiRestConstruct(this, `${props?.stackName}-lambda-restapi-${process.env.ENV}`, {
      name: `${props?.stackName}-lambda-restapi-${process.env.ENV}`,
      lambda: helloWorldLambda,
      role: iamRole,
      resource: 'api',
      endpoints: [
        'GET /hello', 'POST /hello',
      ]
    });

    

    

  }
}
