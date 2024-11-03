import {ObjectId} from "mongodb";

export namespace ObjectIdUtils {
    export function generate(): string {
        return new ObjectId().toHexString()
    }

    export function isValid(id: string): boolean {
        return ObjectId.isValid(id)
    }

    export function fromString(id: string): ObjectId {
        return new ObjectId(id)
    }

    export function fromStringSafe(id: string): ObjectId | string {
        return ObjectId.isValid(id) ? new ObjectId(id) : id
    }

    export function toString(id: ObjectId): string {
        return id.toHexString()
    }

    export function toStringSafe(id: any): string {
        if (id instanceof ObjectId) return id.toHexString()
        return id.toString()
    }
}