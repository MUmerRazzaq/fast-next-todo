CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT
);

INSERT INTO items (name, description) VALUES ('item1', 'description1');
INSERT INTO items (name, description) VALUES ('item2', 'description2');
