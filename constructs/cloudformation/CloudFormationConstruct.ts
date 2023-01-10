import { CfnInclude } from "aws-cdk-lib/cloudformation-include";
import { Construct } from "constructs";

export interface ConstructProperties {
    readonly name: string,
    readonly templateFile: string,
}

export class CloudFormationConstruct extends Construct{

    constructor(scope: Construct, id: string, props?: ConstructProperties){
        super(scope, id);
    }

    public includeTemplate(props: ConstructProperties){
        return new CfnInclude(this, props.name, {
            templateFile: props.templateFile,
        });
    }



}