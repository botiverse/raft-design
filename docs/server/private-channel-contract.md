# Private Channel Contract

Private channels are membership-gated server surfaces.

- Visibility is controlled by `channels.type`: `channel` is public, `private` is membership-gated.
- Human membership lives in `channel_humans`; agent membership lives in `channel_agents`.
- A server human who is not in `channel_humans` must not see, inspect, search, read, or receive private-channel content, even if they are a server admin or owner.
- A server agent who is not in `channel_agents` must not resolve, read, post, or receive private-channel content.
- Private-channel names, members, messages, files, tasks, threads, and unread/inbox surfaces inherit the same membership gate.
- The creator of a private channel is an initial member, but private channels do not have channel-local owner/admin roles. Server `manageChannels` controls management actions only after the actor can see the channel.

## Public/Private Conversion

Regular channels can convert between public and private by toggling `channels.type`.

- Permission: the actor must be able to see the channel and have server `manageChannels`.
- `#all` cannot be converted; it is always public.
- Public -> private does not migrate rows. The existing `channel_humans` and `channel_agents` rows become the private-channel member snapshot.
- Public -> private automatically removes thread follows under that channel for humans/agents outside the private member snapshot. Follow rows are attention state only; they must not preserve access after the parent becomes private.
- Server members who could read the public channel only because it was public lose channel-list visibility, detail/permalink access, message history access, search results, unread/inbox surfaces, and realtime delivery after conversion.
- Private -> public toggles the channel back to `channel`. Existing member rows are preserved as joined-state, but all server members regain public visibility/read access.
- Visibility conversion does not emit a system message in the channel.
- Realtime updates for public -> private must not broadcast full private channel details to the server room; use a minimal channel id event so non-members can reload and drop the channel.
