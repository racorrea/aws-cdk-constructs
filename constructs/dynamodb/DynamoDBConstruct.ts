import { RemovalPolicy } from "aws-cdk-lib";
import { BillingMode, StreamViewType, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";


export interface ConstructProperties {
    readonly tableName: string;
    readonly partitionKey: any; //{name:xyz, type: string}
    readonly permission?: string,
    readonly replication?: any
}

export class DynamoDBConstruct extends Construct{

    constructor(scope: Construct, id: string, props?: ConstructProperties){
        super(scope, id);
    }

    public createDynamoDBTable(props: ConstructProperties){
        return new Table(this, props.tableName, {
            tableName: props.tableName,
            partitionKey: props.partitionKey,
            billingMode: BillingMode.PAY_PER_REQUEST,
            removalPolicy: RemovalPolicy.DESTROY,
            stream: StreamViewType.NEW_AND_OLD_IMAGES,
            replicationRegions: props.replication ? props.replication : undefined,
        });
    }

}