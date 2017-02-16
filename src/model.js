import Schema from './schema';
import Entity from './entity';

import Adapter from './adapter';
import ModelMerge from './merge/model';
import ModelSerializer from './serializers/model';
import CachingStrategy from './caching-strategy';

import assign from 'lodash/assign';

/**
 * A model is an Entity that has a defined schema and associated data.
 */
export default class Model extends Entity {

  static adapter = Adapter;
  static merge = ModelMerge;
  static serializer = ModelSerializer;
  static cachingStrategy = CachingStrategy;

  static isModel = true;

  _data = {
    isNew: false,
    isDeleted: false
  };
  clientRev = 1;

  constructor(graph, {id, clientId, ...rest}) {
    super(graph);
    this.id = id && id + ''; // TODO: move to setter
    this.clientId = clientId;
    // TODO think through the location of this
    graph.idManager.reifyClientId(this);
    for(var key in rest) {
      this[key] = rest[key];
    }
  }

  get isModel() {
    return true;
  }

  get isLoaded() {
    if(this._loaded) {
      return this._loaded;
    }

    for(var field of this.schema.relationships()) {
      if(field.embedded && this[field.name] && this[field.name].isLoaded) {
        return this._loaded = true;
      }
    }

    return false;
  }

  get isEmbedded() {
    return !!this._parent;
  }

  /**
   * @override
   */
  ref(graph) {
    return new this.constructor(graph, {id: this.id, clientId: this.clientId});
  }

  get schema() {
    return this.constructor.schema;
  }

  /**
   * @override
   *
   * TODO: optimize for no fields loaded (e.g. overwriting an entity created
   * via a fetch that doesn't yet have any data)
   */
  assign(source) {
    Object.assign(this._data, source._data);
    this._parent = source._parent;
    if(!this._loaded) {
      this._loaded = source._loaded;
    }
    this._meta = source._meta;
    return this;
  }

  /**
   * @override
   */
  *relatedEntities() {
    for(let relationship of this.schema.relationships()) {
      let rel = this[relationship.name];
      if(rel) {
        yield rel;
      }
    }
  }

  static defineSchema(config) {
    this.schema.configure(config);
    this.schema.apply(this.prototype);
  }

  static get typeKey() {
    return this.schema.typeKey;
  }

  get typeKey() {
    return this.constructor.typeKey;
  }

  static get schema() {
    // TODO use symbol?
    if(this.hasOwnProperty('_schema')) {
      return this._schema;
    }
    let parent = Object.getPrototypeOf(this),
        parentSchema = parent.schema;

    if(parentSchema) {
      this._schema = Object.create(parentSchema);
    } else {
      this._schema = new Schema();
    }
    return this._schema;
  }

  toString() {
    return `${this.constructor.name}<${this.clientId}, id: ${this.id}>`;
  }

}

// apply the default fields
Model.schema.apply(Model.prototype);
