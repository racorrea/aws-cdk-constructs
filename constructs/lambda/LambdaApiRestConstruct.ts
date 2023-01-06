
import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { ManagedPolicy, Role } from "aws-cdk-lib/aws-iam";
import { Function } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs"
import path = require('path');

export interface ConstructProperties {
    readonly name: string,
    readonly lambda: Function,
    readonly resource: string,
    readonly endpoints?: any,
    readonly role?: Role,
}

export class LambdaApiRestConstruct extends Construct{
    constructor(scope: Construct, id: string, props: ConstructProperties){
        super(scope, id);

        const api = this.createLambdaApiRest(props);
        // props.role ? props.role.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName("service-role/AmazonAPIGatewayInvokeFullAccess")) : undefined;
        const resources = api.root.addResource(props.resource);

        let method = '';
        let path = '';
        let pathParamValue = '';
        for (let value of props.endpoints ) {
            console.log('## ENDPOINT: ' + value);
            method = value.split(' ')[0];
            path = value.split('/')[1];

            resources.addMethod(method);

            if (value.split('/')[2] != undefined){
                const resource = resources.addResource(value.split('/')[2]);
                resource.addMethod(method);
            }

        }

    }

    /**
        const items = api.root.addResource('items');
        items.addMethod('GET');  // GET /items
        items.addMethod('POST'); // POST /items

        const item = items.addResource('{item}');
        item.addMethod('GET');   // GET /items/{item}
     */

    private createLambdaApiRest(props: ConstructProperties) {
        return new LambdaRestApi(this, props.name, {
            handler: props.lambda,
            proxy: false,
        });
    }

    
}