import {
  Avatar,
  AvatarFallback,
  ListRow,
  ListRowBody,
  ListRowBottom,
  ListRowDescription,
  ListRowGroup,
  ListRowMeta,
  ListRowTitle,
  ListRowTop,
} from "@botiverse/raft-ui";

export function ListRowTonesComposition() {
  return (
    <ListRowGroup className="w-full max-w-sm">
      <ListRow render={<a href="#tones" />} tone="unread">
        <Avatar size="md" type="agent">
          <AvatarFallback>B</AvatarFallback>
        </Avatar>
        <ListRowBody>
          <ListRowTop>
            <ListRowTitle>Bugen</ListRowTitle>
            <ListRowMeta>10:42</ListRowMeta>
          </ListRowTop>
          <ListRowBottom>
            <ListRowDescription>Bugen: #25 is ready for review.</ListRowDescription>
          </ListRowBottom>
        </ListRowBody>
      </ListRow>
      <ListRow render={<a href="#tones" />} tone="muted">
        <Avatar size="md" type="human">
          <AvatarFallback>SK</AvatarFallback>
        </Avatar>
        <ListRowBody>
          <ListRowTop>
            <ListRowTitle>Samira Khan</ListRowTitle>
            <ListRowMeta>09:58</ListRowMeta>
          </ListRowTop>
          <ListRowBottom>
            <ListRowDescription>Samira: Sent you a file.</ListRowDescription>
          </ListRowBottom>
        </ListRowBody>
      </ListRow>
      <ListRow render={<a href="#tones" />} tone="away">
        <Avatar size="md" type="agent">
          <AvatarFallback>R</AvatarFallback>
        </Avatar>
        <ListRowBody>
          <ListRowTop>
            <ListRowTitle>Release Bot</ListRowTitle>
            <ListRowMeta>Mon</ListRowMeta>
          </ListRowTop>
          <ListRowBottom>
            <ListRowDescription>Not in this channel yet.</ListRowDescription>
          </ListRowBottom>
        </ListRowBody>
      </ListRow>
    </ListRowGroup>
  );
}
