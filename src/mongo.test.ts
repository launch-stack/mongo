import {describe, expect, it, beforeAll, afterAll} from 'vitest';

import {mongodb, collection} from './mongo';
import {mapWhereOptionToMongoFilter} from "./filters/filter-helpers";

type User = {
    id: string;
    name: string;
    age: number;
    accountId: string;
};

type Order = {
    id: string;
    status: string;
    userId: string;
    orderedAt: Date;
};

describe('MongoDB Library', async () => {
    const mongo = mongodb({
        url: "mongodb://localhost:27017/lib-test",
        collections: {
            user: collection<User>({
                name: 'user',
                objectIdKeys: ['accountId'],
                indexes: [
                    {key: 'name', type: 'text'},
                    {key: 'accountId', type: 1, option: {unique: true}},
                ],
            }),
            orders: collection<Order>({
                name: 'orders',
                objectIdKeys: ['userId'],
            }),
        },
    })

    await mongo.init()

    it('should create all collections', async () => {
        const collections = await mongo.db.collections();
        const collectionNames = collections.map((col) => col.collectionName).sort();
        expect(collectionNames).toEqual(['orders', 'user']);
    });

    describe('User Repository', () => {
        it('should insert a user', async () => {
            const user: User = {
                id: 'user-id-1',
                name: 'John Doe',
                age: 30,
                accountId: 'account-id-1',
            };

            await mongo.user.insert(user);
            const fetchedUser = await mongo.user.findById(user.id);

            expect(fetchedUser).toMatchObject(user);
        });

        it('should find a user by criteria', async () => {
            const user: User = {
                id: 'user-id-2',
                name: 'Jane Smith',
                age: 25,
                accountId: 'account-id-2',
            };

            await mongo.user.insert(user);

            const users = await mongo.user.find({
                where: {
                    name: {eq: 'Jane Smith'},
                },
            });

            expect(users.length).toBe(1);
            expect(users[0]).toMatchObject(user);
        });

        it('should update a user', async () => {
            const userId = 'user-id-1';
            await mongo.user.updateById(userId, {age: 31});

            const updatedUser = await mongo.user.findById(userId);
            expect(updatedUser?.age).toBe(31);
        });

        it('should delete a user', async () => {
            const userId = 'user-id-2';
            const deleted = await mongo.user.deleteById(userId);
            expect(deleted).toBe(true);

            const user = await mongo.user.findById(userId);
            expect(user).toBeNull();
        });

        it('should count users', async () => {
            const count = await mongo.user.count({});
            expect(count).toBe(1);
        });

        it('should check existence of a user', async () => {
            const exists = await mongo.user.exists({id: 'user-id-1'});
            expect(exists).toBe(true);
        });
    });

    describe('Order Repository', () => {
        it('should insert multiple orders', async () => {
            const orders: Order[] = [
                {
                    id: 'order-id-1',
                    status: 'pending',
                    userId: 'user-id-1',
                    orderedAt: new Date(),
                },
                {
                    id: 'order-id-2',
                    status: 'shipped',
                    userId: 'user-id-1',
                    orderedAt: new Date(),
                },
            ];

            await mongo.orders.insertMany(orders, {ordered: true});

            const fetchedOrders = await mongo.orders.find({
                where: {userId: {eq: 'user-id-1'}},
            });

            expect(fetchedOrders.length).toBe(2);
        });

        it('should update orders', async () => {
            await mongo.orders.updateMany(
                {status: {eq: 'pending'}},
                {status: 'completed'}
            );

            const orders = await mongo.orders.find({
                where: {status: {eq: 'completed'}},
            });

            expect(orders.length).toBe(1);
            expect(orders[0].status).toBe('completed');
        });

        it('should aggregate orders', async () => {
            const result = await mongo.orders.aggregate([
                {$match: {userId: 'user-id-1'}},
                {$group: {_id: '$status', count: {$sum: 1}}},
            ]);

            expect(result).toEqual([
                {_id: 'completed', count: 1},
                {_id: 'shipped', count: 1},
            ]);
        });
    });

    describe('Filter Helpers', () => {
        it('should correctly map filters', () => {
            const where = {
                name: {regex: '^John', flags: 'i'},
                age: {gt: 20, lt: 40},
            };

            const filter = mapWhereOptionToMongoFilter(where, []);
            expect(filter).toEqual({
                name: {$regex: /^John/i},
                age: {$gt: 20, $lt: 40},
            });
        });
    });

    afterAll(() => {
        mongo.db.dropDatabase()
    })
});
