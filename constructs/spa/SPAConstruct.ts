import { DnsValidatedCertificate } from "aws-cdk-lib/aws-certificatemanager";
import { CloudFrontWebDistribution, OriginAccessIdentity, SecurityPolicyProtocol, SSLMethod, ViewerCertificate } from "aws-cdk-lib/aws-cloudfront";
import { ARecord, HostedZone, RecordTarget } from "aws-cdk-lib/aws-route53";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";

export interface ConstructProperties {
    domainName: any;
    subdomain: any
    readonly spaName: string,
    readonly hostedZoneId: string,
    readonly indexPage: string,
    readonly errorPage?: string,
    readonly cloudfrontBehaviors?: any,
    readonly certificateArn?: string,
    readonly cloudfrontAliases?: any,
    readonly sslMethod?: SSLMethod,
    readonly securityPolicy?: SecurityPolicyProtocol,
    readonly spaFolder: string,
}

export class SPAConstruct extends Construct{

    constructor(scope: Construct, id: string, props?: ConstructProperties){
        super(scope, id);
    }

    public createSPACloudFront(props: ConstructProperties){
        const spaBucket = this.getS3Bucket(props);
        const accessIdentity = new OriginAccessIdentity(this, `${props.spaName}-OriginAccessIdentity`, {comment: `${props.spaName}-OriginAccessIdentity`});
        const cloudfrontDistribution = new CloudFrontWebDistribution(this, `${props.spaName}-CloudFrontWebDistribution`, this.getCloudfrontConfig(spaBucket, props, accessIdentity));
        const hostedZone = HostedZone.fromHostedZoneAttributes(this, `${props.spaName}-HostedZone`, {
            zoneName: props.domainName,
            hostedZoneId: props.hostedZoneId
          });
        const domainName = props.subdomain ? `${props.subdomain}.${props.domainName}` : props.domainName;

        new BucketDeployment(this, `${props.spaName}-BucketDeployment`, {
            sources: [Source.asset(props.spaFolder)],
            destinationBucket: spaBucket,
            distribution: cloudfrontDistribution,
            distributionPaths: ['/', `/${props.indexPage}`]
        });

        new ARecord(this, `${props.spaName}-ARecord`, {
            zone: hostedZone,
            recordName: domainName,
            target: RecordTarget.fromAlias(new CloudFrontTarget(cloudfrontDistribution)),
        });


    }

    private getS3Bucket(props: ConstructProperties){
        const bucketConfig = {
            websiteIndexDocument: props.indexPage,
            websiteErrorDocument: props.errorPage,
            publicReadAccess: true,
        }
        return new Bucket(this, `${props.spaName}-Bucket`, bucketConfig);
    }

    private getCloudfrontConfig(spaBucket: Bucket, props: ConstructProperties, accessIdentity: OriginAccessIdentity, certificate?:DnsValidatedCertificate ){
        const cloudfrontConfig: any = {
            originConfigs:[
                {
                    s3OriginSource: {
                        s3BucketSource: spaBucket,
                        originAccessIdentity: accessIdentity,
                      },
                      behaviors: props.cloudfrontBehaviors ? props.cloudfrontBehaviors : [{ isDefaultBehavior: true }],
                }
            ],
            // We need to redirect all unknown routes back to index.html for angular routing to work
            errorConfigurations: [{
                errorCode: 403,
                responsePagePath: (props.errorPage ? `/${props.errorPage}` : `/${props.errorPage}`),
                responseCode: 200,
            },
            {
                errorCode: 404,
                responsePagePath: (props.errorPage ? `/${props.errorPage}` : `/${props.errorPage}`),
                responseCode: 200,
            }],
        };

        if (typeof props.certificateArn !== 'undefined' && typeof props.cloudfrontAliases !== 'undefined') {
            cloudfrontConfig.aliasConfiguration = {
                acmCertRef: props.certificateArn,
                names: props.cloudfrontAliases,
            };
        }
        if (typeof props.sslMethod !== 'undefined') {
            cloudfrontConfig.aliasConfiguration.sslMethod = props.sslMethod;
        }
        
        if (typeof props.securityPolicy !== 'undefined') {
            cloudfrontConfig.aliasConfiguration.securityPolicy = props.securityPolicy;
        }
        
        if (typeof props.domainName !== 'undefined' && typeof certificate !== 'undefined') {
            cloudfrontConfig.viewerCertificate = ViewerCertificate.fromAcmCertificate(certificate, {
                aliases: [props.subdomain ? `${props.subdomain}.${props.domainName}` : props.domainName],
            });
        }

        return cloudfrontConfig;
    }

}