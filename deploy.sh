export AWS_PROFILE=default
export AWS_REGION=us-east-1

# Clean cdk.out directory
rm -rf ./cdk.out
npm run build
cdk synth --all

#Deploy only defined stack
cdk deploy aws-cdk-constructs-stack-dev-dev


#Deploy all Stacks
#cdk deploy --all