// rs.initiate({
//     _id: 'rs0',
//     members: [
//         { _id: 0, host: 'mongo:27017' }
//     ]
// });

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

db.createUser({
  user: 'monitor',
  pwd: 'monitor',
  roles: [
    {
      role: 'clusterMonitor',
      db: 'admin',
    },
  ],
});

