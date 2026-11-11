---
title: "It took me three days to add one HttpOnly to a refresh token"
description: "Moving an SPA's refresh token into an HttpOnly cookie that JavaScript can't read: what that stopped and what it didn't, the refresh race I found after shipping and how I plan to fix it, and the concepts and lessons I picked up along the way."
summary: "What HttpOnly stops and what it doesn't, plus the refresh race I found after shipping"
pubDatetime: 2026-11-10T16:15:00+09:00
tags: [Security, SSO, Cookie, Next.js]
related: [cc-baton]
---

I was handed an SSO ticket. My first thought was this.

What exactly is SSO?

I'm a backend developer. But this work lived in the frontend repo (Next.js), and it was about login cookies. In one line: "move the refresh token into an HttpOnly cookie." One cookie attribute. It took me three days. The first day was almost all studying. (I couldn't design anything until I had the concepts.)

Then, after it shipped, I found one more problem in the structure I had built. This post is a record of both.  
Plenty of services are built this way, and the problems here are the ones this structure tends to produce.

## SSO, briefly

SSO (Single Sign-On) lets several services trust the result of one authentication. The auth server that handles login signs a token, and each service only verifies that signature. Users type their password once, and the organization manages authentication in one place. Daangn's reason for centralizing auth was that when every service runs its own, the weakest one sets the security level for all of them ([How has Daangn's authentication changed?](https://medium.com/daangn/%EB%8B%B9%EA%B7%BC%EC%9D%98-%EC%9D%B8%EC%A6%9D%EC%9D%80-%EC%96%B4%EB%96%BB%EA%B2%8C-%EB%8B%AC%EB%9D%BC%EC%A0%B8-%EC%99%94%EC%9D%84%EA%B9%8C%EC%9A%94-a50dd4b7b44c), in Korean).

There are two broad ways to build it. Either the auth server sets a cookie on the root domain so sibling services all receive it, or the browser goes to the auth server and comes back with a one-time code that gets exchanged for tokens (OAuth2, OIDC). The first needs the auth server and the service to share a registrable domain; when the domains differ, it runs into the browser's third-party cookie blocking. That is also why Wikimedia moved login between wikis on different domains to a redirect-based flow ([SUL3](https://www.mediawiki.org/wiki/MediaWiki_Platform_Team/SUL3)).

The service I worked on had a different registrable domain from its auth server, and used the second approach.

## What I did

Login used to work like this.

```
1. The auth server redirects back to the service with a one-time code in the URL
2. Browser JS exchanges that code for tokens                → auth server
3. Browser JS stores the accessToken and refreshToken from the response via document.cookie
```

The problem is step 3. A refresh token is what lets you keep getting new access tokens. JS wrote it into a cookie directly. A cookie JS can write is a cookie JS can read.

The new flow:

```
1. (same)
2. The browser sends the code to a server route on the same origin
   → the server exchanges it for tokens with the auth server
3. The server sets the refreshToken with Set-Cookie: HttpOnly; Secure; SameSite=Lax
   The response body carries only the accessToken
```

JS can't delete an HttpOnly cookie either. The old logout cleared cookies through `document.cookie`; left alone, that delete would be refused and the refresh token would survive logout. On the next page navigation the server would use it to log the user right back in. A logout that doesn't log you out. So deleting the cookie, and refreshing tokens from open tabs, also moved to server routes on the same origin. Setting, reading, and deleting the cookie now all happen on one server.

Moving the exchange to the server changes who the auth server sees as the caller: the server instead of the browser. Whether that was acceptable wasn't mine to decide, so before starting I sent questions to the auth server team, and one answer that came back settled the design!

### What it stopped, and what's left

Even if XSS (an attack that injects malicious script into the site) happens, the refresh token can't be taken. Compare what stealing each token gets you.

|                 | Stolen refreshToken                                        | Stolen accessToken                              |
| --------------- | ---------------------------------------------------------- | ----------------------------------------------- |
| What you can do | Keep issuing new access tokens. It's a key-copying machine | Call the API with that token. It's a single key |
| For how long    | Until the refresh token expires. Long                      | Its remaining lifetime. Short                   |

Two things remain, though.

First, JS can still read the access token. The API authenticates with an `Authorization: Bearer` header, and JS builds that header by reading the token. Make the access token HttpOnly too and every API call breaks. And while XSS is running inside the page, it doesn't even need to steal a token. It can just send requests as the user. What HttpOnly stops is "take it and use it somewhere else."

Second, CSRF is not an attack HttpOnly stops. CSRF is another site getting the user's browser to send a request, and the browser attaches cookies to that request on its own. HttpOnly cookies included.

Getting the access token out of the browser as well would take a full BFF (Backend for Frontend), where the frontend server forwards every API call. That is beyond one ticket. So this time I removed the long-lived key-copying machine, and wrote the short-lived single key into the PR as an accepted risk. That way I have an answer when someone later asks, "why didn't you close this one?"

## The problem I found after shipping

While checking in the test environment that the cookie showed up as HttpOnly, I fired two refresh calls at once from the console. Calling it directly from the console skips the app's own de-duplication, so it imitates two tabs refreshing at the same moment.

```js
// A request that uses the refreshToken cookie to get a new accessToken
const refresh = () =>
  fetch("<refresh route>", { method: "POST" }).then(r => r.status);

// Send the same request twice at once
Promise.all([refresh(), refresh()]).then(console.log); // [401, 200]
```

One succeeded and one got a 401. And the refreshToken was gone from the cookie store.

### Why it happened

Three things lined up.

1. **The auth server replaces the refresh token on every refresh (rotation).** When the old, just-used token was presented again, it was rejected.
2. **De-duplication only worked inside a single tab.** "A refresh is in flight" was remembered in one variable, and each tab has its own. The cookie is shared by every tab in the browser.
3. **The route I wrote read a 401 as "the token is dead" and deleted the cookie.**

```
Starting cookie: R0
Tab A: refresh with R0 → success, new cookie R1 stored
Tab B: refresh with R0 (still) → 401, cookie deleted
→ if B's response arrives after A's, R1 is wiped too
```

Number 3 was a rule I added on purpose. Deleting the cookie on a transient failure would cut off healthy tabs, so the idea was to delete only when the auth server clearly refused. But the loser's 401 in a race doesn't mean the token is dead. It means another tab just replaced it. The structure that could race was already there; my rule turned the damage into "every tab logged out."

### Why didn't the first design show it?

- **I only looked at requests one at a time.** Design and verification checked "what comes back when this request arrives." Rejection conditions, cookie attributes, logout: every single request was correct. The order in which two requests overlap was not on the checklist.
- **It doesn't happen with one tab.** The in-tab de-duplication prevents it. You need several tabs open and woken at once, and that never came up while developing and checking.
- **Nothing shows at the moment the cookie is deleted.** The access token is still alive. Only when it expires do refreshes fail in every tab at once. Cause and symptom are far apart, so to the user it looks like "sometimes I get logged out for no reason."

It's not a token leak; it's a dropped session.

I worked through whether it happens without firing two calls on purpose. With one tab, almost never. The likeliest overlap is several tabs open, then the laptop lid opens or the network reconnects: every tab wakes and refetches at once. The test environment logs also showed an overlap during ordinary use.

### How I plan to fix it

Two places, together.

- **Line up refreshes across tabs.** The browser's [Web Locks API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API) (`navigator.locks`) lets tabs on the same origin share one lock. Only the tab holding the lock refreshes. A tab that waited and then got the lock first checks whether another tab already refreshed, and skips its own refresh if so. The wait has an upper bound so a stalled tab can't make the others wait forever.
- **Don't delete the cookie on a refresh 401.** The cookie is deleted only on logout and session expiry. If a truly dead cookie lingers, the next login overwrites it. The side that got the 401 retries once after a short pause, because the cookie may have been replaced in the meantime.

This doesn't close everything. A lock is an agreement inside the browser. The refresh that runs on the server during page navigation can't take part in it, so that path can still overlap with a tab. But since the cookie is no longer deleted, the other tabs are fine and only the loser passes through the login page once. If the auth server's session is still alive it comes straight back; otherwise the user logs in again.

One thing is left to confirm: how much the auth server revokes when it detects reuse of an old token. The OAuth security guidance ([RFC 9700](https://www.rfc-editor.org/rfc/rfc9700)) describes that when a rotating refresh token is used again, the authorization server treats it as a sign of theft and revokes the active token as well. If the auth server behaves that way, the winner's new token dies too, and a client-side fix can't cover it all. That is a question for the auth server team.

I've built the fix ahead of time and checked it in a temporary harness with multi-tab scenarios. I plan to ship it once I have the answer to that question.

## Concepts I learned along the way

One line each, for what I studied on day one and what I picked up while untangling the race.

| Concept                     | What I learned                                                                                                                                                                                 |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| origin and site             | A different subdomain is already a different origin, so CORS applies. But cookies treat anything under the same registrable domain as the same side. I didn't know there were two yardsticks.. |
| Two ways to set a cookie    | I didn't even understand the phrase "JS sets a cookie." There's the server setting it through a response header, and separately, JS running in the browser writing to `document.cookie`.       |
| HttpOnly                    | I thought it was a kind of cookie; it's an attribute. Only the server can add it when setting the cookie, and then JS can neither read nor delete it. It still rides along on requests!        |
| Cookie identity             | Same name, different Domain or Path: different cookie. To delete one you have to spell it exactly the way it was set.                                                                          |
| SameSite                    | Decides whether this cookie rides on requests coming from another site. It has to be Lax for the login to hold when you arrive from an email link or come back from the login server.          |
| Third-party cookie blocking | Not a server setting but a rule the browser decides. I can't change it, so the structure shouldn't lean on it.                                                                                 |
| XSS and CSRF                | XSS is someone else's script running inside my page; CSRF is someone else's page making my browser send a request. HttpOnly only stops XSS from walking off with the token.                    |
| access and refresh          | A stolen access token dies soon. A stolen refresh token keeps producing access tokens. The one worth hiding is refresh.                                                                        |
| Refresh token rotation      | Refreshing replaces the refresh token too. I handled moving the new value into the cookie, but never thought about a request that arrives at the same time with the old value.                 |
| single-flight and Web Locks | When identical requests overlap, send one and share the result. Inside a tab one variable does it; across tabs you need `navigator.locks`.                                                     |

I also looked up why every security attribute on cookies is off by default. Cookies came before the same-origin policy, and the safeguards were bolted on one at a time afterwards. Changing the original behavior would break the existing web, so developers have to switch on the safe options themselves. HttpOnly was one of those.

## What I took away

1. **HttpOnly blocks reading, not sending.** It closes the path where XSS carries the token away, and has nothing to do with CSRF.
2. **Move one cookie, and where it's set, read, and deleted all move with it.** If any of them falls out of step, you end up with two cookies, or one that survives logout.
3. **Changing the structure to stop one attack opens another attack surface.** Moving the exchange into a server route opened a new path. If an attacker puts a form carrying their own account's code on another site, the moment the victim opens that page the server sets the attacker's account cookie in the victim's browser (login CSRF). I closed it by having the route accept only same-origin JSON requests. This was when I first really felt why OAuth has a `state` value.
4. **Don't pin a failure response to a single meaning.** One rule that read 401 as "dead token" grew a race into a full logout. Irreversible handling like deletion belongs only where the response can mean one thing.
5. **Lock at the same scope as the sharing.** The cookie is shared by every tab in the browser, but the lock covered one tab. When the scope of a resource and the scope of its lock differ, races happen in the gap.
6. **A two-line experiment found it before review did.** This code had been through several reviews. The problem only surfaced when I sent the same request twice at once from the console. "What happens if this arrives twice at the same time?" is a question to ask of every auth path.
7. **First check whether the test environment has the same site boundary as production.** In the development environment the service and the auth server were the same site, so cookies travelled as first-party. It couldn't reproduce production's cross-site condition, so a problem there stays invisible in development. If I ever set up a test environment myself, I intend to design the domains first so that it has the same site boundary as production.
8. **Start by defining what you don't know.** What I did on day one was list what I didn't know. I split it into three: general knowledge, my system, and the other system (the auth server), and for each concept I made sure I understood "why do I need to know this?" before moving on. That cut the questions for the auth server team down to three. It felt like a detour, but surfacing what I didn't know early and filling it in turned out to be the cheapest path.

## Things to think about next

- **Whether to go full BFF.** The current structure is close to what the IETF draft [OAuth 2.0 for Browser-Based Applications](https://datatracker.ietf.org/doc/draft-ietf-oauth-browser-based-apps/) calls a Token-Mediating Backend. The server holds the long-lived refresh token and gives JS only the short-lived access token. Hiding the access token too means the server forwards every call, and the more you lean on cookies, the more CSRF defense matters. Right now JS puts the token in a header itself, so a request sent by another site carries no authentication. Going BFF gives up that immunity.
- **Where a token lives is decided by who uses it.** Only the server uses the refresh token, so hiding it cost nothing. JS uses the access token on every request, so hiding it breaks things. Accept the exposure and keep the lifetime short instead.
- **Don't lean on what you can't change.** Browser policy keeps moving. Safari blocked third-party cookies in 2020; Chrome said it would, then dropped the plan. A design that leans on that policy will break again someday.
- **Auth straddles the FE/BE boundary.** A frontend developer and I talked about "couldn't this just be done in the backend?" It could have been. But I judged that the rules stay consistent only when setting, reading, and deleting the cookie live on one server, so this time it went into the Next.js server. That is a hard call to make from inside one repo. Getting to touch auth in the frontend repo as a backend developer is the biggest thing I got out of this.

It took three days to add one HttpOnly. Most of those three days went into questions, not code. And honestly, the most valuable question came after shipping: what happens if it arrives twice at the same time... Always account for race conditions and concurrency. 😂

Next post: [Running two Claude accounts with less friction](/en/posts/cc-baton/)
