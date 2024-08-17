db.auth('root', 'password');

db = db.getSiblingDB('admin');

db.createUser({
  user: 'ulmanbots',
  pwd: 'parole',
  roles: [
    {
      role: 'readWrite',
      db: 'ulmanbots',
    },
  ],
});
