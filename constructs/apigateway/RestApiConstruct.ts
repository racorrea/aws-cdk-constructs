
import { RestApi } from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs"
import path = require('path');

export interface ConstructProperties {
    readonly name: string,
    readonly domainName?: any,
    readonly deployOptions?: any,
}

export class RestApiConstruct extends Construct{
    constructor(scope: Construct, id: string, props?: ConstructProperties){
        super(scope, id);

    }
    // Todo: revisar por que crea doble // al inicio
    public createApiRest(props: ConstructProperties) {
        return new RestApi(this, props.name, {
            restApiName: props.name,
            domainName: props.domainName,
            deployOptions: props.deployOptions,
        });
    }

    

    
}