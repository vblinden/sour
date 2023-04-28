# Sour
Sessions for Deno Fresh with the following stores: 
 - [x] PostgreSQL
 - [ ] MySQL
 - [ ] Redis
 - [x] Cookie
 - [x] Memory

## Usage
Create an `_middleware.ts` file in the root of your project with:

```typescript
import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { sql } from "./db.ts";

const store = new Postgres(sql);

import { middleware, Postgres } from "https://deno.land/x/sour/mod.ts";

export const handler = [
  (request: Request, context: MiddlewareHandlerContext) =>
    middleware(request, context, {
      store: store,
      // Other options (see SessionOptions.ts)
    }),
];

```

After this you can add access and modify the session in your handlers, like:

```typescript
import { WithSession } from "https://deno.land/x/sour/types.ts";

export const hander: Handlers<Data, WithSession> = {
  GET(_request, context) {
    const { session } = context.state;

    // Get a value...
    session.get("user_id");

    // Set a value...
    session.set("user_id", 973891); 

    // Check if session has value...
    session.has("user_id");

    // Flash a value to the session, which will get deleted when it is accessed...
    session.flash("error", "Username is required");

    // Will delete the session...
    session.delete();

    return context.render!();
  },
};
```

### Memory
This is the most simple store, sessions are gone after you restart the application.

```typescript
const store = new Memory();
```

### PostgreSQL

This store uses the [postgresjs](https://deno.land/x/postgresjs) library to execute its queries.

```typescript
import { sql } from "./db.ts";
const store = new Postgres(sql);
```

Don't forget too apply the following query to your database:
```sql
create table if not exists sessions (id varchar not
null primary key, data varchar)
```

### Redis

TODO

### MySQL

TODO

### Cookie
Use the `middlewareCookie` instead of `middleware`. 

## Credit

Lots of inspiration taken from [Oak Sessions](https://github.com/jcs224/oak_sessions) & [fresh-session](https://github.com/xstevenyung/fresh-session).
