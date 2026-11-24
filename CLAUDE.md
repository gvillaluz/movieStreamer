# movieStreamer

React + Vite app in `client/`. Movies and TV come from TMDB; the video plays inside a third-party
embed iframe on the watch page (`client/src/pages/Watch/WatchPage.jsx`).

## Video servers

Current servers (the switcher on the watch page, in order):

| Label | Provider | Notes |
|---|---|---|
| Server 1 | VidLink (`vidlink.pro`) | Default for everything except anime. Takes `autoplay=false`, `nextbutton=true`, `startAt`. Fails to show subtitles on some anime episodes. |
| Server 2 | VidZee (`player.vidzee.wtf`) | Default for anime. Takes no URL options: always autoplays, ignores autoplay and start-position parameters, remembers the position itself per browser. Movies and series have a Quality menu (1080p/720p/480p/360p); anime is a single fixed 720p stream with no Quality menu. |

Anime = a series with `original_language === 'ja'` and the Animation genre (id 16), the same rule as the
Anime rows. Anime opens on Server 2; a server the viewer picked by hand (saved in `player_server`) always wins.
| Server 3 | vsembed (`vsembed.ru`) | Original provider, last resort. |

Progress events from the players feed "Continue watching" (`client/src/utils/watchHistory.js`,
`PLAYER_ORIGINS` and `parsePlayerMessage`). A new provider must post progress events and its origin
must be added to `PLAYER_ORIGINS`.

## Old options

Providers that were used before or tested and dropped. Kept here so they are not re-tested by accident.

- **VidFast** (`vidfast.vc`; `vidfast.pro` redirects there). Was Server 2 until it was replaced by VidZee.
  Event shape is the same as VidLink's. Notes from when it was in use:
  - Load it from `vidfast.vc` directly: `vidfast.pro` redirects there, which adds a round trip and moves
    the player to an origin the iframe's `allow="fullscreen"` was not granted to, so fullscreen did nothing.
  - URL format: `https://vidfast.vc/movie/{tmdb}?autoPlay=false&theme=e50914&startAt={s}` and
    `https://vidfast.vc/tv/{tmdb}/{season}/{episode}?autoPlay=false&nextButton=true&theme=e50914&startAt={s}`.
  - No anime route.
  - Showed no `<video>` under automated Chrome (it may refuse to run under automation), so it was not
    measured in the provider tests.
  - To bring it back: add `{ id: 'vidfast', label: ... }` to `SERVERS`, a branch in `videoSourceLink`,
    and `https://vidfast.vc` and `https://vidfast.pro` to `PLAYER_ORIGINS`.

Tested in a provider comparison (movie, TV and anime, Inception / Breaking Bad S1E1 / Frieren S1E1) and
not adopted:

- **VidNest** (`vidnext.pro`): loaded all three at full length. Events are a flat
  `{ source: "vidnest-player" | "vidnext-player", event, currentTime, duration }` with no `type` wrapper
  and no TMDB id or episode, so `parsePlayerMessage` needs a branch for it. Resume works with `?t=1h5m30s`.
  Controls are small (about 23-25px targets).
- **Vidy** (`vidy.st`): played movie and TV, but no video for the anime episode.
- **vidsrc.mov**: plays, but sends no progress events, so "Continue watching" would not work.
- **BingeAPI** (`bingeapi.st`), **VidGold** (`player.vidgold.net`): no `<video>` found under automated Chrome.
- **Videasy** and **VidCore**: wrappers that nest the real player in a sandboxed iframe, which the player
  detects and refuses to run in.
