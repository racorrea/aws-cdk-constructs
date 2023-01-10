import * as cdk from 'aws-cdk-lib';
import { CfnOutput, RemovalPolicy } from 'aws-cdk-lib';
import { PolicyStatement, Role } from 'aws-cdk-lib/aws-iam';
import { Construct } from "constructs";
import { LambdaConstruct } from '../constructs/lambda/LambdaConstruct';
import { S3Construct } from '../constructs/s3/S3Construct';

const LAMBDA_CODE_PATH = '../../src/handler';

// 👇 extend the StackProps interface
interface TestStackProps extends cdk.StackProps {
    deploymentEnvironment: 'dev' | 'prod',
}

export class TestStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: TestStackProps) {
        super(scope, id, props);

        // 👇 get the environment from props
        const { deploymentEnvironment } = props;
        const isProduction = deploymentEnvironment === 'prod';

        const bucket = new S3Construct(this, `${props?.stackName}-bucket-${process.env.ENV}`)
            .createBucket({
                bucketName: `${props?.stackName}-bucket-${process.env.ENV}`,
                removalPolicy: isProduction ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
            });

        const lambda = new LambdaConstruct(this, `${props?.stackName}-lambda-${process.env.ENV}`)
            .createLambdaFunction({
                functionName: `${props?.stackName}-lambda-${process.env.ENV}`,
                handler: 'HelloWorldHandler.handler',
                codePath: LAMBDA_CODE_PATH,
                stage: process.env.ENV ?? '',
            });

        //bucket.grantRead(helloWorldLambda);

        lambda.addToRolePolicy(new PolicyStatement({

            actions: ['s3:GetObject', 's3:List*'],
            resources: [
                bucket.bucketArn,
                bucket.arnForObjects('*'),
            ]
        }));

        // new CfnOutput(this, 'Output', {
        //     value: lambda.functionArn,
        //     exportName: `${props?.stackName}-lambda-${process.env.ENV}-arn`,
        //     description: 'ARN Hello world lambda'
        // });
    }


}