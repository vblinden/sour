import { SessionData, SessionOptions } from "./types.ts";
import { Session } from "./session.ts";
import {
  deleteCookie,
  getCookies,
  MiddlewareHandlerContext,
  nanoid,
  setCookie,
} from "./deps.ts";

export const middleware = async (
  request: Request,
  context: MiddlewareHandlerContext,
  options: SessionOptions,
) => {
  const cookieName = options.cookie?.name ?? "fresh_session";
  const sessionId = getCookies(request.headers)[cookieName] ?? await nanoid(32);
  const url = new URL(request.url);

  let data: Promise<SessionData | null> | SessionData | null = null;

  if (sessionId) {
    data = await options.store.byId(sessionId);
  }

  if (!data) {
    data = {
      _flash: {},
      _expire: new Date(
        Date.now() +
          (options?.expiration
            ? options?.expiration * 1000
            : 60 * 60 * 2 * 1000),
      ).getTime(),
      _delete: false,
    };
  }

  context.state.session = new Session(sessionId, data);

  const response = await context.next();

  await options.store.persist(sessionId, data);
  await options.store.gc();

  setCookie(response.headers, {
    name: cookieName,
    path: "/",
    secure: true,
    domain: url.hostname,
    expires: Date.now() +
      (options?.expiration ? options.expiration * 1000 : 60 * 60 * 2 * 1000), // Two hours...
    sameSite: "Lax",
    value: sessionId,
    httpOnly: true,
    ...options.cookie,
  });

  if (data._delete) {
    deleteCookie(response.headers, cookieName);
  }

  return response;
};
