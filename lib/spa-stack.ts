import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { SPAConstruct } from '../constructs/spa/SPAConstruct';

export class SpaStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id);

        let certificateArn = '';
        let domainName = '';
        let hostedZoneId = '';
        process.env?.CERTIFICATE_ARN ? certificateArn = process.env?.CERTIFICATE_ARN  : certificateArn = '';
        process.env?.DOMAIN_NAME ? domainName = process.env?.DOMAIN_NAME  : domainName = '';
        process.env?.HOSTED_ZONE_ID ? hostedZoneId = process.env?.HOSTED_ZONE_ID  : hostedZoneId = '';

        new SPAConstruct(this, `${props?.stackName}-spa-${process.env.ENV}`).createSPACloudFront({
            spaName: `${props?.stackName}-spa-${process.env.ENV}`,
            hostedZoneId: hostedZoneId,
            indexPage: 'index.html',
            errorPage: 'index.html',
            spaFolder: './src/spa/build',
            domainName: domainName,
            subdomain: 'spa',
            certificateArn: certificateArn,
            cloudfrontAliases: [`spa.${domainName}`]
        });

    }
}