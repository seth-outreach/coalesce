import {expect} from 'chai';

import DefaultContainer from 'coalesce/container';
import Graph from 'coalesce/graph';
import Model from 'coalesce/model';

describe('model', function() {

  lazy('container', () => new DefaultContainer());
  lazy('graph', function() {
    return this.container.get(Graph);
  });

  lazy('Post', function() {
    let klass = class Post extends Model {}
    klass.defineSchema({
      typeKey: 'post',
      attributes: {
        title: {
          type: 'string'
        }
      }
    });
    return klass;
  });

  describe('attributes', function() {

    lazy('fields', function() {
      return {title: 'test'};
    });
    lazy('post', function() {
      return new this.Post(this.graph, this.fields);
    });

    describe('getter', function() {

      it('gets', function() {
        expect(this.post.title).to.eq('test')
      });

    });

    describe('setter', function() {

      it('sets', function() {
        this.post.title = 'mutant';
        expect(this.post.title).to.eq('mutant')
      });

    });

  });

  describe('.schema', function() {

    lazy('Parent', function() {
      let klass = class Parent extends Model {

      };
      klass.defineSchema({
        attributes: {
          title: {
            type: 'string'
          }
        }
      });

      return klass;
    });

    lazy('Child', function() {
      return class Child extends this.Parent {

      };
    });

    it('contains fields', function() {
      expect(this.Parent.schema.title.name).to.eq('title');
    });

    it('subclasses contain parent class fields', function() {
      expect(this.Child.schema.title.name).to.eq('title');
    });

  });

  describe('.assign()', function() {

    lazy('source', function() { return new this.Post(this.graph, {title: 'A'}); });
    lazy('target', function() { return new this.Post(this.graph, {title: 'B'}); });

    subject(function() { return this.target.assign(this.source); });

    it('copies attributes', function() {
      expect(this.subject.title).to.eq('A');
      expect(this.subject._data).to.eq(this.source._data);
    });

  });

  describe('.clone()', function() {

    lazy('source', function() { return new this.Post(this.graph, {title: 'A'}); });
    lazy('destGraph', function() { return this.container.get(Graph); });

    subject(function() { return this.source.clone(this.destGraph); });

    it('returns new instance with same attributes', function() {
      expect(this.subject).to.not.eq(this.source);
      expect(this.subject._data).to.eq(this.source._data);
    });

  });

});