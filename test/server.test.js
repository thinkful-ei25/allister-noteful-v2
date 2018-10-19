'use strict';

const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const knex = require('../knex');
const expect = chai.expect;

chai.use(chaiHttp);

describe('Sanity check', function () {

    it('true should be true', function () {
        expect(true).to.be.true;
    });

    it('2 + 2 should equal 4', function () {
        expect(2 + 2).to.equal(4);
    });

});


describe('Static Server', function () {

    it('GET request "/" should return the index page', function () {
        return chai.request(app)
            .get('/')
            .then(function (res) {
                expect(res).to.exist;
                expect(res).to.have.status(200);
                expect(res).to.be.html;
            });
    });

});

describe('Noteful API', function () {
    const seedData = require('../db/seedData');

    beforeEach(function () {
        return seedData('./db/noteful.sql');
    });

    after(function () {
        return knex.destroy(); // destroy the connection
    });

    describe('GET /api/notes', function () {

        it('should return the default of 10 Notes ', function () {
            return chai.request(app)
                .get('/api/notes')
                .then(function (res) {
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body).to.be.a('array');
                    expect(res.body).to.have.length(10);
                });
        });

        it('should return correct search results for a valid searchTerm', function () {
            return chai.request(app)
                .get('/api/notes?searchTerm=about%20cats')
                .then(function (res) {
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body).to.be.a('array');
                    expect(res.body).to.have.length(4);
                    expect(res.body[0]).to.be.an('object');
                });
        });

    });

    describe('404 handler', function () {

        it('should respond with 404 when given a bad path', function () {
            return chai.request(app)
                .get('/garbage')
                .then(function (res) {
                    expect(res).to.have.status(404);
                })
        });

    });

    describe('GET /api/notes', function () {

        it('should return an array of objects where each item contains id, title, and content', function () {
            return chai.request(app)
                .get('/api/notes')
                .then(function (res) {
                    expect(res.body).to.be.a('array');
                    res.body.forEach(item => {
                        expect(item).to.be.an('object');
                        expect(item).to.include.keys('id', 'title', 'content');
                    })

                })
        });

        it('should return an empty array for an incorrect searchTerm', function () {
            return chai.request(app)
                .get('/api/notes?searchTerm=INVALIDSEARCHTERM')
                .then(function (res) {
                    expect(res.body).to.be.a('array');
                    expect(res.body.length).to.equal(0)
                })
        });

    });

    describe('GET /api/notes/:id', function () {

        it('should return correct note when given an id', function () {
            return chai.request(app)
                .get('/api/notes/1000')
                .then(function (res) {
                    expect(res.body).to.have.property('id', 1000)
                })
        });

        it('should respond with a 404 for an invalid id', function () {
            return chai.request(app)
                .get('/api/notes/9999')
                .then(function (res) {
                    expect(res).to.have.status(404)
                })
        });

    });

    describe('POST /api/notes', function () {

        it('should create and return a new item when provided valid data', function () {
            const myNote = { "title": "Test Note", "content": "Test content", "tags": [] }
            return chai.request(app)
                .post('/api/notes')
                .send(myNote)
                .then(function (res) {
                    expect(res).to.have.status(201)
                    expect(res.body).to.be.an('object')
                })
        });

        it('should return an error when missing "title" field', function () {
            const myNote = { "content": "Test content", "tags": [] }
            return chai.request(app)
                .post('/api/notes')
                .send(myNote)
                .then(function (res) {
                    expect(res).to.have.status(400)
                    expect(res.body).to.have.property("message", "Missing `title` in request body")
                });
        });

    });
    describe('PUT /api/notes/:id', function () {
        const updateObj = { "title": "Test Update Object", "content": "Test update content", "folderId": 101, "tags": [1, 2, 3] }
        it('should update the note', function () {
            return chai.request(app)
                .put('/api/notes/1002')
                .send(updateObj)
                .then(function (res) {
                    expect(res.body).to.have.property("title", "Test Update Object")
                    expect(res.body).to.have.property("content", "Test update content")
                    expect(res.body).to.have.property("folderId", 101)
                    expect(res.body).to.have.property("tags")
                    expect(res.body.tags).to.have.length(3)
                    res.body.tags.forEach(tag => {
                        expect(tag).to.have.keys('id', 'name')
                    })
                })
        });



        it('should respond with a 404 for an invalid id', function () {
            return chai.request(app)
                .put('/api/notes/9999')
                .send(updateObj)
                .then(function (res) {
                    expect(res).to.have.status(404)
                })
        });

        it('should return an error when missing "title" field', function () {
            const myNote = { "content": "Test content", "tags": [] }
            return chai.request(app)
                .put('/api/notes/1000')
                .send(myNote)
                .then(function (res) {
                    expect(res).to.have.status(400)
                    expect(res.body).to.have.property("message", "Missing `title` in request body")
        
                });
            })


    });

      describe('DELETE  /api/notes/:id', function () {
        
        it('should delete an item by id', function () {
            return chai.request(app)
            .delete('/api/notes/1000')
            .then(function(res) {
                expect(res).to.have.status(204)
            })
        });

      });

});