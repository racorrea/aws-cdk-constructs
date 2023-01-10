import { ParameterTier, StringListParameter, StringParameter } from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";

export interface ConstructProperties {
    readonly parameterName: string,
    readonly parameterStringValue?: string,
    readonly parameterStringList?: any,
    readonly description?: string,
    readonly tier?: ParameterTier,
}

export class SSMConstruct extends Construct{

    constructor(scope: Construct, id: string, props?: ConstructProperties){
        super(scope, id);
    }

    

    public createStringParameter(props: ConstructProperties) {

        if (!props.parameterStringValue) {
            throw new Error("Error creating new parameter. Empty value");
        }

        return new StringParameter(this, props.parameterName, {
            parameterName: props.parameterName,
            stringValue: props.parameterStringValue ? props.parameterStringValue : '',
            description: props.description,
            tier: props.tier,
        });
    }

    public createListParameter(props: ConstructProperties) {

        if (!props.parameterStringList) {
            throw new Error("Error creating new parameter. Empty list");
        }

        return new StringListParameter(this, props.parameterName, {
            parameterName: props.parameterName,
            stringListValue: props.parameterStringList ? props.parameterStringList : [], // ['Initial parameter value A', 'Initial parameter value B']
        });
    }

    /**
     * name
     */
    public getStringParameter(props: ConstructProperties) {
        return StringParameter.fromStringParameterName(this, props.parameterName, props.parameterName);
    }

}