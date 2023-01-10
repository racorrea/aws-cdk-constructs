#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Stack } from '../lib/stack';
import { SpaStack } from '../lib/spa-stack';
import { TestStack } from '../lib/test-stack';
import { CfnOutput, DefaultStackSynthesizer, Stage } from 'aws-cdk-lib';
import { Role } from 'aws-cdk-lib/aws-iam';

// require('dotenv').config({ path: `./.env.${process.env.NODE_ENV}` })
const environment = "dev"
require('dotenv').config({ path: `./.env.${environment}` })

const app = new cdk.App();
const env = {
  account: process.env.AWS_ACCOUNT_ID ?? process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.AWS_PRIMARY_REGION ?? process.env.CDK_DEFAULT_REGION
}

const stackName = `${process.env.NAME}-stack-${environment}`;

if (!process.env?.CERTIFICATE_ARN) {
  throw new Error('Could not resolve certificate. Please pass it with the CERTIFICATE_ARN environment variable.');
}

const testStack = new TestStack(app, stackName, {
  stackName: stackName,
  env: env,
  tags:{
    environment: 'dev',
    project: 'poc-aws-cdk',
  },
  synthesizer: new DefaultStackSynthesizer({
    fileAssetsBucketName: `cdk-${stackName}-${env.region}-assets`,

  }),
});

new Stage(app, 'DevStage');

// only apply to resources of type Bucket
cdk.Tags.of(testStack).add('object-group', 'test-bucket', {
  includeResourceTypes: ['AWS::S3:Bucket'],
});

// new Stack(app, stackName, {
//   stackName: `${process.env.NAME}-${environment}`,
//   env: env,
// });

// new SpaStack(app, `${process.env.NAME}-spa-${environment}`, {
//   stackName: `${process.env.NAME}-spa-${environment}`,
//   env: env,
// });