# @launchstack/mongo (Alpha)

A typesafe, lightweight MongoDB library providing a fully typesafe and comprehensive wrapper over the official MongoDB Node.js driver.

## Disclaimer

**This library is in alpha stage and is subject to change. Use it at your own risk.**

## Installation

```bash
npm install @launchstack/mongo
```

## Features

- Fully typesafe interactions with MongoDB collections
- Simplified repository pattern for CRUD operations
- Supports custom entity mappings
- Index creation and management
- Query building with typesafe filters

## Usage

### Setup

```typescript
import { mongodb, collection } from '@launchstack/mongo';

type User = {
  id: string;
  name: string;
  age: number;
  accountId: string;
};

(async () => {
  const mongo = await mongodb({
    url: 'mongodb://localhost:27017/my-database',
    collections: {
      user: collection<User>({
        name: 'user',
        objectIdKeys: ['accountId'],
        indexes: [
          { key: 'name', type: 'text' },
          { key: 'accountId', type: 1, option: { unique: true } },
        ],
      }),
    },
  });

  // Use the repository
  const newUser: User = {
    id: 'user-id-1',
    name: 'John Doe',
    age: 30,
    accountId: 'account-id-1',
  };

  await mongo.user.insert(newUser);

  const fetchedUser = await mongo.user.findById('user-id-1');
  console.log(fetchedUser);

  // Close the connection when done
  await mongo.close();
})();
```

### Defining Collections

```typescript
const userCollection = collection<User>({
  name: 'user',
  objectIdKeys: ['accountId'],
  indexes: [
    { key: 'name', type: 'text' },
    { key: 'accountId', type: 1, option: { unique: true } },
  ],
});
```

### Performing CRUD Operations

- **Insert a document**

  ```typescript
  await mongo.user.insert(newUser);
  ```

- **Find a document by ID**

  ```typescript
  const user = await mongo.user.findById('user-id-1');
  ```

- **Update a document**

  ```typescript
  await mongo.user.updateById('user-id-1', { age: 31 });
  ```

- **Delete a document**

  ```typescript
  await mongo.user.deleteById('user-id-1');
  ```

## Contributing

Contributions are welcome! Please open issues or submit pull requests for any changes.

## License

This project is licensed under the MIT License.