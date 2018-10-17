'use strict';

const express = require('express');

// Create an router instance (aka "mini-app")
const router = express.Router();

const knex = require('../knex');

// TEMP: Simple In-Memory Database
// const data = require('../db/notes');
// const simDB = require('../db/simDB');
// const notes = simDB.initialize(data);

// Get All (and search by query)

router.get('/', (req, res, next) => {
  const { searchTerm } = req.query;
  const { folderId } = req.query;
  knex
    .select('notes.id', 'title', 'content', 'folders.id as folderId', 'folders.name as folderName')
    .from('notes')
    .leftJoin('folders', 'notes.folder_id', 'folders.id')
    .modify(queryBuilder => {
      if (searchTerm) {
        queryBuilder.where('title', 'like', `%${searchTerm}%`);
      }
    })
    .modify(function (queryBuilder) {
      if (folderId) {
        queryBuilder.where('folder_id', folderId);
      }
    })
    .orderBy('notes.id')
    .then(results => {
      res.json(results)
    })
    .catch(err => {
      console.error(err);
      next(err)
    });
});

// router.get('/', (req, res, next) => {
//   const { searchTerm } = req.query;

//   notes.filter(searchTerm)
//     .then(list => {
//       res.json(list);
//     })
//     .catch(err => {
//       next(err);
//     });
// });

// Get a single item
router.get('/:id', (req, res, next) => {
  const id = req.params.id;

  knex
    .select('notes.id', 'title', 'content', 'folders.id as folderId', 'folders.name as folderName')
    .from('notes')
    .leftJoin('folders', 'notes.folder_id', 'folders.id')
    .where('notes.id', id)
    .then(item => {
      if (item[0]) {
        res.json(item[0])
      }
      else {
        next();
      }
    })
    .catch(err => {
      next(err);

    })
});



//   notes.find(id)
//     .then(item => {
//       if (item) {
//         res.json(item);
//       } else {
//         next();
//       }
//     })
//     .catch(err => {
//       next(err);
//     });
// });

// Put update an item
// 


router.put('/:id', (req, res, next) => {
  const id = req.params.id;
  //   /***** Never trust users - validate input *****/
  const updateObj = {};
  const updateableFields = ['title', 'content', 'folder_id'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });

  //   /***** Never trust users - validate input *****/
  if (!updateObj.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }


  knex('notes')
    .returning(['notes.id', 'title', 'content'])
    .where('notes.id', id)
    .update(updateObj)
    .then(() => {
      return knex.select('notes.id', 'title', 'content', 'folder_id as folderId', 'folders.name as folderName')
        .from('notes')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .where('notes.id', id)
    })
    .then(results => {
      if (results[0]) {
        res.json(results[0]);
      }
      else {
        next();
      }
    })
    .catch(err => {
      next(err);
    })
});


//   notes.update(id, updateObj)
//     .then(item => {
//       if (item) {
//         res.json(item);
//       } else {
//         next();
//       }
//     })
//     .catch(err => {
//       next(err);
//     });
// });

// Post (insert) an item
router.post('/', (req, res, next) => {
  const { title, content, folderId } = req.body;

  const newItem = { title, content, folder_id: folderId };
  /***** Never trust users - validate input *****/
  if (!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }
  let noteId;
  knex('notes')
    .returning(['id', 'title', 'content'])
    .insert(newItem)
    .then(results => {
      noteId = results[0].id
      //;
      return knex.select('notes.id', 'title', 'content', 'folder_id as folderId', 'folders.name as folderName')
        .from('notes')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .where('notes.id', noteId)
    })
    .then(results => {
      res.location(`http://${req.headers.host}/notes/${results[0].id}`).status(201).json(results[0])
    })
    .catch(err => {
      next(err);
    })
});


//   notes.create(newItem)
//     .then(item => {
//       if (item) {
//         res.location(`http://${req.headers.host}/notes/${item.id}`).status(201).json(item);
//       }
//     })
//     .catch(err => {
//       next(err);
//     });
// });

// Delete an item
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;

  knex('notes')
    .where('notes.id', id)
    .del()
    .then(res.sendStatus(204))
    .catch(err => {
      next(err);
    })

});

//   notes.delete(id)
//     .then(() => {
//       res.sendStatus(204);
//     })
//     .catch(err => {
//       next(err);
//     });
// });

module.exports = router;
