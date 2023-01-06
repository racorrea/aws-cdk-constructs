import * as cdk from 'aws-cdk-lib';
import { LambdaIntegration, SecurityPolicy } from 'aws-cdk-lib/aws-apigateway';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { AttributeType } from 'aws-cdk-lib/aws-dynamodb';
import { Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { ARecord, HostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { ApiGateway } from 'aws-cdk-lib/aws-route53-targets';
import { Construct } from 'constructs';
import process = require('process');
import { RestApiConstruct } from '../constructs/apigateway/RestApiConstruct';
import { DynamoDBConstruct } from '../constructs/dynamodb/DynamoDBConstruct';
import { LambdaConstruct } from '../constructs/lambda/LambdaConstruct';
import { SPAConstruct } from '../constructs/spa/SPAConstruct';

const LAMBDA_CODE_PATH = '../../src/handler';
const METHOD_OPTIONS = {methodResponses: [{statusCode: '200'}, {statusCode: '400'}, {statusCode: '500'}]};

export class Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id);

    
    let certificateArn = '';
    let domainName = '';
    let hostedZoneId = '';
    process.env?.CERTIFICATE_ARN ? certificateArn = process.env?.CERTIFICATE_ARN  : certificateArn = '';
    process.env?.DOMAIN_NAME ? domainName = process.env?.DOMAIN_NAME  : domainName = '';
    process.env?.HOSTED_ZONE_ID ? hostedZoneId = process.env?.HOSTED_ZONE_ID  : hostedZoneId = '';
    // certificateArn = 'arn:aws:acm:us-east-1:756557892660:certificate/a3d3754d-79cb-4521-96d3-7797312ddf6f';

    const recordName = `api.${process.env.DOMAIN_NAME}`;
    console.log('DOMAIN_NAME = ' + domainName);
    const hostedZone = HostedZone.fromHostedZoneAttributes(this, domainName, {
      zoneName: domainName,
      hostedZoneId: hostedZoneId
    });
    
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

    const helloWorldApiRest = new RestApiConstruct(this, `${props?.stackName}-restapi-${process.env.ENV}`).createApiRest({
      name: `${props?.stackName}-restapi-${process.env.ENV}`,
      domainName:{
        domainName: recordName,
        certificate: certificate,
        securityPolicy: SecurityPolicy.TLS_1_2,
        basePath: 'v1'
      },
      deployOptions: {
        stageName: 'dev',
        variables: {
          REGION: process.env.AWS_PRIMARY_REGION,
        }
      }
    });

    // Api Routes
    const routes = helloWorldApiRest.root.addResource('demo');
    routes.addMethod('GET', new LambdaIntegration(helloWorldLambda), METHOD_OPTIONS);
    routes.addMethod('POST', new LambdaIntegration(helloWorldLambda), METHOD_OPTIONS);

    const route = routes.addResource('{id}');
    route.addMethod('GET', new LambdaIntegration(helloWorldLambda), METHOD_OPTIONS);

    //create recordset
    new ARecord(this, `${props?.stackName}-route53-${process.env.ENV}`, {
      zone: hostedZone,
      recordName: recordName,
      target: RecordTarget.fromAlias(new ApiGateway(helloWorldApiRest)),
    });
    

    // Implement DynamoDB Table
    const table = new DynamoDBConstruct(this, `${props?.stackName}-dynamodb-${process.env.ENV}`).createDynamoDBTable({
      tableName: `${props?.stackName}-table-${process.env.ENV}`,
      partitionKey: {
        name: "id",
        type: AttributeType.STRING,
      }
    });

    // Asign permissions for write in the table
    table.grantReadWriteData(helloWorldLambda);


    

    

  }
}
