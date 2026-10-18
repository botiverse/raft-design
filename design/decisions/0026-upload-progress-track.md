---
title: Upload progress is a cyan track inside the container
summary: Upload progress is cyan, on its own thin track inside the file card or thumbnail, not pink.
number: 0026
status: accepted
date: 2026-10-18
---

# 0026. Upload progress is a cyan track inside the container

## Context

The product code draws upload progress in pink. Progress is a passive indicator, and pink is for "to do". A progress bar or colored band attached to one edge of a rounded card is cut into an odd shape near the corners.

## Decision

Progress is cyan, on its own 4px track with a 2px radius inside the container: under the file name in a file card, aligned with the text, and 6px from all edges in a composer thumbnail. Both are the same track.

## Consequences

Pink stays for "to do", and no rounded container has a bar on its edge.

## Related

- [Shape](../foundations/shape.md#nothing-on-the-edge-of-a-rounded-container)
- [MessageAttachment](../../packages/ui/src/components/message-attachment/message-attachment.md)
