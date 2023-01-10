import { Construct } from "constructs";

export interface ConstructProperties {
    
}

export class TemplateConstruct extends Construct{

    constructor(scope: Construct, id: string, props?: ConstructProperties){
        super(scope, id);
    }

}