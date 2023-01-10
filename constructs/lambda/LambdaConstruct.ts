import { Tags } from "aws-cdk-lib";
import { Role } from "aws-cdk-lib/aws-iam";
import { Architecture, Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs"
import path = require('path');

export interface ConstructProperties {
    readonly functionName: string,
    readonly handler: string,
    readonly codePath: string,
    readonly role?: Role,
    readonly environment?: any,
    readonly memorySize?: number,
    readonly logRetention?: any,
    readonly tracing?: any,
    readonly stage: string,
}

export class LambdaConstruct extends Construct {


    constructor(scope: Construct, id: string, props?: ConstructProperties) {
        super(scope, id);
    }

    public createLambdaFunction(props: ConstructProperties) {
        const lambda = new Function(this, props.functionName, {
            functionName: props.functionName,
            handler: props.handler,
            code: Code.fromAsset(path.resolve(__dirname, props.codePath)),
            runtime: Runtime.NODEJS_16_X,
            architecture: Architecture.ARM_64,
            memorySize: props.memorySize ? props.memorySize : undefined,
            role: props.role ? props.role : undefined,
            environment: props.environment ? props.environment : undefined,
            logRetention: props.logRetention ? props.logRetention : undefined,
            tracing: props.tracing ? props.tracing : undefined,
        });

        Tags.of(lambda).add('resource', 'lambda');
        Tags.of(lambda).add('name', props.functionName);

        return lambda;
    }



}