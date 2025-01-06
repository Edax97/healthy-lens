// To parse this data:
//
//   import { Convert, Actor } from "./file";
//
//   const actor = Convert.toActor(json);

export interface Actor {
    did:         string;
    handle:      string;
    displayName: string;
}

// Converts JSON strings to/from your types
export class ParseActor {
    public static toActor(json: string): Actor {
        return JSON.parse(json);
    }

    public static actorToJson(value: Actor): string {
        return JSON.stringify(value);
    }
}
