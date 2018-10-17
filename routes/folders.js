'use strict';

const express = require('express');

const router = express.Router();

const knex = require('../knex');


router.get('/', (req, res, next) => {
    knex.select('id', 'name')
      .from('folders')
      .then(results => {
        res.json(results);
      })
      .catch(err => next(err));
  });

  
  router.get('/:id', (req, res, next) => {
      
    knex.select('id', 'name')
      .from('folders')
      .where('id', req.params.id)
      .then(item => {
        if (item[0]) {
        res.json(item[0])
        }
        else {
          next();
        }
      })
      .catch(err => next(err));
  });
  

  router.put('/:id', (req, res, next) => {
      // Will fill in later
  });

  router.post('/', (req, res, next) => {
    const {name} = req.body
    const newFolder = {name}
    if (!newFolder.name) {
        const err = new Error('Missing `name` in request body');
        err.status = 400;
        return next(err);
      }
      knex('folders')
      .returning(['id', 'name'])
      .insert(newFolder)
      .then(results => {
          res.status(201).json(results[0])
      })
      .catch(err => next(err));
       
  });

  router.delete('/:id', (req, res, next) => {
    

    knex('folders')
    .where('id', req.params.id)
    .del()
    .then(res.sendStatus(204))
    .catch(err => {
      next(err);
    });
});
  
  
  
  module.exports = router;


