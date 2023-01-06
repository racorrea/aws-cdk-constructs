#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Stack } from '../lib/stack';

// require('dotenv').config({ path: `./.env.${process.env.NODE_ENV}` })
const environment="development"
require('dotenv').config({ path: `./.env.${environment}` })

const app = new cdk.App();
const region = {
    account: process.env.AWS_ACCOUNT_ID,
    region: process.env.AWS_PRIMARY_REGION ?? process.env.CDK_DEFAULT_REGION
}

const stackName = `${process.env.NAME}-stack-${environment}`;

if (!process.env?.CERTIFICATE_ARN) {
  throw new Error('Could not resolve certificate. Please pass it with the CERTIFICATE_ARN environment variable.');
}


new Stack(app, stackName, {
  stackName: `${process.env.NAME}-${environment}`,
  env: region,
});