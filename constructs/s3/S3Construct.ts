import { RemovalPolicy } from "aws-cdk-lib";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export interface ConstructProperties {
    readonly bucketName: string;
    readonly bucketArn?: string;
    readonly removalPolicy?: RemovalPolicy;
    readonly autoDeleteObjects?: boolean;
    readonly versioned?: boolean;
}

export class S3Construct extends Construct {

    constructor(scope: Construct, id: string, props?: ConstructProperties) {
        super(scope, id);
    }

    public createBucket(props: ConstructProperties) {
        return new Bucket(this, props.bucketName, {
            bucketName: props.bucketName,
            removalPolicy: props.removalPolicy,
            autoDeleteObjects: props.autoDeleteObjects,
            versioned: props.versioned,
        });
    }

    public importExistingBucket(props: ConstructProperties, bucketType: string) {
        let bucket;

        switch (bucketType) {
            case 'arn':
                bucket = Bucket.fromBucketAttributes(this, props.bucketName, {
                    bucketArn: props.bucketArn,
                });
                break;
            case 'name':
                bucket = Bucket.fromBucketAttributes(this, props.bucketName, {
                    bucketName: props.bucketName,
                });
                break;
            default:
                bucket = Bucket.fromBucketAttributes(this, props.bucketName, {
                    bucketName: props.bucketName,
                });
                break;
        }

        return bucket;
    }

}