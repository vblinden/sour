import { decryptCryptoJSAES, encryptCryptoJSAES } from "./crypto.ts";
import {
  deleteCookie,
  getCookies,
  MiddlewareHandlerContext,
  nanoid,
  setCookie,
} from "./deps.ts";
import { Session } from "./session.ts";
import { CookieOptions, SessionData } from "./types.ts";

const appKey = Deno.env.get("APP_KEY") ?? "super-unsecure-key-please-set-key";

const decryptDataString = async (data: string): Promise<SessionData | null> => {
  if (!data) return null;

  try {
    return JSON.parse(await decryptCryptoJSAES(data, appKey));
  } catch {
    return null;
  }
};

const encryptDataString = async (data: SessionData): Promise<string> => {
  const dataString = JSON.stringify(data);

  return await encryptCryptoJSAES(
    dataString,
    appKey,
  );
};

export const middleware = async (
  request: Request,
  context: MiddlewareHandlerContext,
  options?: Partial<CookieOptions> | null,
) => {
  const cookieName = options?.name ?? "fresh_session";
  const cookieDataName = `${cookieName}_data`;
  const sessionId = getCookies(request.headers)[cookieName] ?? await nanoid(32);
  const url = new URL(request.url);

  if (["_frsh", ".ico"].some((part) => url.pathname.includes(part))) {
    return await context.next();
  }

  let data: Promise<SessionData | null> | SessionData | null = null;

  if (sessionId) {
    data = await decryptDataString(getCookies(request.headers)[cookieDataName]);

    if (
      data && (
        data._expire === null ||
        data._expire < Date.now()
      )
    ) {
      data._delete = true;
    }
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

  // Set cookie for data...
  setCookie(response.headers, {
    name: cookieDataName,
    path: "/",
    secure: true,
    domain: url.hostname,
    expires: Date.now() +
      (options?.expiration ? options?.expiration * 1000 : 60 * 60 * 2 * 1000), // Two hours...
    sameSite: "Lax",
    value: await encryptDataString(data),
  });

  // Set cookie for session id...
  setCookie(response.headers, {
    name: cookieName,
    path: "/",
    secure: true,
    domain: url.hostname,
    expires: Date.now() +
      (options?.expiration ? options?.expiration * 1000 : 60 * 60 * 2 * 1000), // Two hours...
    sameSite: "Lax",
    value: sessionId,
  });

  if (data._delete) {
    deleteCookie(response.headers, cookieName);
    deleteCookie(response.headers, cookieDataName);
  }

  return response;
};
