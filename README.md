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

### Memory

### PostgreSQL

This store uses the [postgresjs](https://deno.land/x/postgresjs) library.

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

## Credit

Lots of inspiration taken from [Oak Sessions](https://github.com/jcs224/oak_sessions) & [fresh-session](https://github.com/xstevenyung/fresh-session).
