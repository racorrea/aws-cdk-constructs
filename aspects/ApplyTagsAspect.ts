import { IAspect, Tags, TagManager, ITaggable } from "aws-cdk-lib";
import { IConstruct } from "constructs";


export class ApplyTagsAspect implements IAspect {
    #tags: Tags;
  
    constructor(tags: Tags) {
      this.#tags = tags;
    }
  
    visit(node: IConstruct) {
      if (TagManager.isTaggable(node)) {
        Object.entries(this.#tags).forEach(([key, value]) => {
          this.applyTag(node, key, value);
        });
      }
    }
  
    applyTag(resource: ITaggable, key: string, value: string) {
      resource.tags.setTag(
        key,
        value
      );
    }
  }