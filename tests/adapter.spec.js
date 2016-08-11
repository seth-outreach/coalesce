import {expect} from 'chai';
import fetchMock from 'fetch-mock';

import Container, {Post} from './support/simple-hierarchy';
import Model from 'coalesce/model';
import Adapter from 'coalesce/adapter';
import Session from 'coalesce/session';
import Graph from 'coalesce/graph';
import Query from 'coalesce/query';

describe('adapter', function() {

  beforeEach(function() {
    fetchMock.restore();
  });
  lazy('container', () => new Container())
  subject('adapter', function() {
    return this.container.get(Adapter);
  });

  describe('.load()', function() {

    lazy('entity', function() {
      return this.session.build(Post, {id: 1});
    });
    lazy('opts', () => {{}});
    lazy('session', () => new Session());

    subject(function() {
      return this.adapter.load(this.entity, this.opts, this.session);
    });

    context('with a model', function() {

      beforeEach(function() {
        fetchMock.get('/posts/1', JSON.stringify({type: 'post', id: 1, title: 'revived'}));
      });

      it('GETs data and resolves model', async function() {
        let res = await this.subject;
        expect(res).to.be.an.instanceOf(Post);
        expect(res.title).to.eq('revived');
        expect(res.id).to.eq("1");
      });

    });

    context('with a query', function() {

      lazy('entity', function() {
        return this.session.fetchQuery(Post, {});
      });

      beforeEach(function() {
        fetchMock.get('/posts', JSON.stringify([{type: 'post', id: 1, title: 'a'}, {type: 'post', id: 2, title: 'b'}]));
      });

      it('GETs data and resolves query', async function() {
        let res = await this.subject;
        expect(res).to.be.an.instanceOf(Query);
        let arr = Array.from(res)
        expect(arr.length).to.eq(2);
        expect(arr[0]).to.be.an.instanceOf(Post);
      });

    });

  });

  describe('.persist()', function() {

    lazy('session', () => new Session());
    lazy('entity', function() {
      return this.session.create(Post, {title: 'Be Persistent'});
    });
    lazy('shadow', function() {});
    lazy('opts', function() {
      return {};
    });
    subject(function() {
      return this.adapter.persist(this.entity, this.session, this.opts, this.session);
    });

    context('with new entity', function() {

      beforeEach(function() {
        fetchMock.post('/posts', JSON.stringify({type: 'post', id: 1, title: 'Be Persistent'}));
      });

      it('POSTs and resolves model', async function() {
        let model = await this.subject;
        expect(model.id).to.eq('1');
        expect(model.isNew).to.be.false;
      });

    });

    context('with destroyed entity', function() {

      lazy('entity', function() {
        let entity = this.session.build(Post, {id: 1, title: 'Beyond the grave'});
        this.session.destroy(entity);
        return entity;
      });

      beforeEach(function() {
        fetchMock.delete('/posts/1', JSON.stringify({}));
      });

      it('DELETEs and resolves model', async function() {
        let model = await this.subject;
        expect(model.id).to.eq('1');
        expect(model.isDeleted).to.be.true;
      });

    });

    context('with updated entity', function() {

      lazy('entity', function() {
        let entity = this.session.build(Post, {id: 1, title: 'Be Persistent'});
        entity.title = 'More Persistent';
        return entity;
      });

      beforeEach(function() {
        fetchMock.put('/posts/1', JSON.stringify({type: 'post', id: 1, title: 'More Persistent'}));
      });

      it('PUTs and resolves model', async function() {
        let model = await this.subject;
        expect(model.id).to.eq('1');
        expect(model.title).to.eq('More Persistent');
        expect(model.isNew).to.be.false;
      });

    });

  });

});
