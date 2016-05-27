import Entity from './entity';

import Immutable from 'immutable';

export default class Collection extends Entity {

  _data = null;

  constructor(graph, iterable) {
    super(graph);
    function* clientIds(iterable) {
      if(iterable) {
        for(var entity of iterable) {
          yield entity.clientId;
        }
      }
    }
    this._data = Immutable.List(clientIds(iterable));
  }

  // currently all collections are transient
  get isTransient() {
    return true;
  }

  get isCollection() {
    return true;
  }

  *[Symbol.iterator]() {
    for(var clientId of this._data) {
      yield this.graph.get({clientId});
    }
  }

  get(index) {
    let clientId = this._data.get(index);
    if(!clientId) {
      return;
    }
    return this.graph.get({clientId});
  }

  /**
   * @override
   */
  *relatedEntities() {
    yield* this;
  }

}