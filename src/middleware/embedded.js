/**
 * Middleware to handle embedded models
 */
export default class EmbeddedMiddleware {

  static singleton = true;

  async call({plan, entity}, next) {
    if(entity._parent) {
      console.assert(plan, "Plan required for embedded operations");
      let parentEntity = plan.session.get({clientId: entity._parent}),
          parentOp = plan.get(parentEntity);

      let res = await parentOp._promise;

      for(var child of res.relatedEntities()) {
        if(entity.isEqual(child)) {
          return child;
        }
      }

      // in the case of a delete, it is not expected for the parent entity
      // to still reference it
      if(entity.isDeleted) {
        return entity;
      }

      throw "Embedded child not found inside parent";
    } else {
      return next();
    }
  }

}