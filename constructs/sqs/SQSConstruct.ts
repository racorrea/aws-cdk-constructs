import { Duration, Environment, RemovalPolicy, ResourceEnvironment } from "aws-cdk-lib";
import { CfnQueue, DeadLetterQueue, Queue } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";

export interface ConstructProperties {
    readonly queueName: string,
    readonly fifo?: boolean,
    readonly removalPolicy?: RemovalPolicy,
    readonly retentionPeriod?: Duration,
    readonly visibilityTimeout?: Duration,
    readonly deadLetterQueue?: DeadLetterQueue,
    readonly tags?: any,
}

export class SQSConstruct extends Construct{

    constructor(scope: Construct, id: string, props?: ConstructProperties){
        super(scope, id);
    }

    public createQeue(props: ConstructProperties) {
        return new Queue(this, props.queueName, {
            queueName: props.queueName,
            fifo: props.fifo,
            removalPolicy: props.removalPolicy,
            retentionPeriod: props.retentionPeriod,
            visibilityTimeout: props.visibilityTimeout,
            deadLetterQueue: props.deadLetterQueue,
        });
    }

    public addQueueTags(props: ConstructProperties){
        return new CfnQueue(this, props.queueName, {
            tags: props.tags,
        });
    }

}