DROP TABLE IF EXISTS notes_tags;
DROP TABLE IF EXISTS notes;
DROP TABLE IF EXISTS folders;
DROP TABLE IF EXISTS tags;


CREATE TABLE folders (
    id serial PRIMARY KEY,
    name text NOT NULL
);
ALTER SEQUENCE folders_id_seq RESTART WITH 100;

CREATE TABLE tags (
    id serial PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE notes (

    id serial PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    created TIMESTAMP NOT NULL DEFAULT now(),
    folder_id int REFERENCES folders(id) ON DELETE SET NULL
);
ALTER SEQUENCE notes_id_seq RESTART WITH 1000;

CREATE TABLE notes_tags (
  note_id INTEGER NOT NULL REFERENCES notes ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags ON DELETE CASCADE
);

INSERT INTO folders (name) VALUES
  ('Archive'),
  ('Drafts'),
  ('Personal'),
  ('Work')
  RETURNING id, name;

INSERT INTO notes (title, content, folder_id) VALUES 
('5 life lessons learned from cats', 'Lorem ipsum dolor sit amet', 100),
('What the government doesn''t want you to know about cats', 'Posuere sollicitudin aliquam ultrices', 100),
('The most boring article about cats you''ll ever read', 'Lorem ipsum dolor sit amet', 100),
('7 things lady gaga has in common with cats', 'Posuere sollicitudin aliquam ultrices', 100),
('The most incredible article about cats you''ll ever read', 'Lorem ipsum dolor sit amet', 100),
('10 ways cats can help you live to 100', 'Posuere sollicitudin aliquam ultrices', 100),
('9 reasons you can blame the recession on cats', 'Lorem ipsum dolor sit amet', 100),
('10 ways marketers are making you addicted to cats', 'Posuere sollicitudin aliquam ultrices', 100),
('11 ways investing in cats can make you a millionaire', 'Lorem ipsum dolor sit amet', 100),
('Why you should forget everything you learned about cats', 'Posuere sollicitudin aliquam ultrices', 100)
RETURNING id, title, folder_id;

INSERT INTO tags(name) VALUES
('money'),
('health'),
('learn')
RETURNING id, name;

INSERT INTO notes_tags (note_id, tag_id) VALUES
(1000, 3),
(1001, 3),
(1002, 3),
(1003, 3),
(1004, 3),
(1005, 2),
(1006, 1),
(1007, 1),
(1008, 1),
(1009, 3)
RETURNING note_id, tag_id;