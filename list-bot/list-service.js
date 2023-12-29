import sqlite3 from 'sqlite3';
const { Database } = sqlite3;

class ListService {
  constructor() {
    this.db = new Database('lists.db');
    this.initDatabase();
  }

  initDatabase() {
    this.db.serialize(() => {
      this.db.run(`
        CREATE TABLE IF NOT EXISTS lists (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT,
          creator TEXT,
          creation_date TEXT
        )
      `);

      this.db.run(`
        CREATE TABLE IF NOT EXISTS list_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          list_id INTEGER,
          item TEXT,
          FOREIGN KEY (list_id) REFERENCES lists(id)
        )
      `);
    });
  }

  createList(userId, title, creationDate) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO lists (title, creator, creation_date) VALUES (?, ?, ?)',
        [title, userId, creationDate],
        function (err) {
          if (err) {
            console.error(err);
            resolve(false);
          } else {
            resolve(true);
          }
        }
      );
    });
  }

  getUserLists(userId) {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM lists WHERE creator = ?', [userId], (err, rows) => {
        if (err) {
          console.error(err);
          resolve([]);
        } else {
          resolve(rows);
        }
      });
    });
  }

  getUserListsCount(userId) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT COUNT(*) AS count FROM lists WHERE creator = ?', [userId], (err, row) => {
        if (err) {
          console.error(err);
          resolve(0);
        } else {
          resolve(row.count || 0);
        }
      });
    });
  }

  getListByTitle(userId, title) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM lists WHERE creator = ? AND title = ?', [userId, title], (err, row) => {
        if (err) {
          console.error(err);
          resolve(null);
        } else {
          resolve(row);
        }
      });
    });
  }

  addItemToList(listId, item) {
    return new Promise((resolve, reject) => {
      this.db.run('INSERT INTO list_items (list_id, item) VALUES (?, ?)', [listId, item], function (err) {
        if (err) {
          console.error(err);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  removeItemFromList(listId, item) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM list_items WHERE list_id = ? AND item = ?', [listId, item], function (err) {
        if (err) {
          console.error(err);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }
}

export default ListService;