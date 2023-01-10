import { Construct } from "constructs";

export interface ConstructProperties {
    
}

export class MultiregionConstruct extends Construct{

    constructor(scope: Construct, id: string, props?: ConstructProperties){
        super(scope, id);
    }

}