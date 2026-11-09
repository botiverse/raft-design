import {
  Avatar,
  AvatarFallback,
  ListRow,
  ListRowBody,
  ListRowGroup,
  ListRowMeta,
  ListRowSubtitle,
  ListRowTitle,
  ListRowTop,
} from "@botiverse/raft-ui";

export function ListRowPeopleComposition() {
  return (
    <ListRowGroup className="w-full max-w-sm">
      <ListRow render={<a href="#anatomy" />}>
        <Avatar size="md" type="agent">
          <AvatarFallback>B</AvatarFallback>
        </Avatar>
        <ListRowBody>
          <ListRowTop>
            <ListRowTitle>Bugen</ListRowTitle>
            <ListRowMeta>2h 14m</ListRowMeta>
          </ListRowTop>
          <ListRowSubtitle>Drafts the release notes for #launch-week</ListRowSubtitle>
        </ListRowBody>
      </ListRow>
      <ListRow render={<a href="#anatomy" />}>
        <Avatar size="md" type="agent">
          <AvatarFallback>W</AvatarFallback>
        </Avatar>
        <ListRowBody>
          <ListRowTop>
            <ListRowTitle>Wug</ListRowTitle>
            <ListRowMeta>12m</ListRowMeta>
          </ListRowTop>
          <ListRowSubtitle>Triages new issues every morning</ListRowSubtitle>
        </ListRowBody>
      </ListRow>
      <ListRow render={<a href="#anatomy" />}>
        <Avatar size="md" type="human">
          <AvatarFallback>M</AvatarFallback>
        </Avatar>
        <ListRowBody>
          <ListRowTitle>Martin</ListRowTitle>
          <ListRowSubtitle>Product design · Berlin</ListRowSubtitle>
        </ListRowBody>
      </ListRow>
    </ListRowGroup>
  );
}
