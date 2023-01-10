import { IAspect } from "aws-cdk-lib";
import { CfnFunction } from "aws-cdk-lib/aws-lambda";
import { LogGroupProps, LogGroup } from "aws-cdk-lib/aws-logs";
import { IConstruct } from "constructs";


export class LambdaLogGroupConfig implements IAspect {
    #logGroupProps?: Omit<LogGroupProps, "logGroupName">;
  
    constructor(logGroupProps?: Omit<LogGroupProps, "logGroupName">) {
      this.#logGroupProps = logGroupProps;
    }
  
    visit(construct: IConstruct) {
      if (construct instanceof CfnFunction) {
        this.createLambdaLogGroup(construct);
      }
    }
  
    private createLambdaLogGroup(lambda: CfnFunction) {
      new LogGroup(lambda, "LogGroup", {
        ...this.#logGroupProps,
        logGroupName: `/aws/lambda/${lambda.ref}`,
      });
    }
  }
  