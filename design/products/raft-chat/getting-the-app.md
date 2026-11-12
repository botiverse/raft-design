---
title: Raft Chat — Getting the app
summary: Where people get Raft's apps — the public download page and the app sections of Settings → About — and the one rule for both, the visitor's own device first and every other platform one row of the same weight.
---

# Raft Chat — Getting the app

People get Raft's apps in two places: the public download page (`/download`, no sign-in) and the Desktop app and Mobile app sections of Settings → About. One rule orders both: **the device the person is on decides what comes first, and every other platform is one row of the same weight.** The page can tell the device from the browser, so it doesn't ask; telling is a guess, so every platform stays one tap away. huxijin found the page's order muddled and agreed to this one (2026-11-12, #triage:a230ad1c).

## The download page

Who arrives: a phone that scanned the code in Settings → About without the app installed (with the app, the link opens it), a computer from a newsletter, from the message an old desktop app gets when it is refused, or from a typed link, and an iPad, which tells the server it is a Mac. The page takes a browser that says Macintosh and has a touch screen (`maxTouchPoints > 1`) for an iPad; an iPhone never says Macintosh. The phone is the visitor the page was made for.

From top to bottom, in one card:

- **The title,** Get the Raft app. No line asking the person to choose their device when the page knows it.
- **This device:** a small label naming it (For this Mac, For this iPhone, For this Android phone), then the page's one pink button, `size="lg"`, the card's full width ([Button](../../../packages/ui/src/components/button/button.md#which-color)): the App Store on an iPhone or an iPad, Google Play on an Android phone, the installer on a computer (Download for Mac, for its chip when the release has one build per chip). Under it at most one footnote link, the same platform's other way in: Download the APK on Android, for phones without Google Play; on Linux the other package (the .deb under the AppImage); and Intel Mac only when the release splits the builds and the browser can't tell the chip. A footnote link that downloads a file ends in the download icon, as a store link ends in ↗ ([Navigation](../../patterns/navigation.md#links-that-leave-raft)).
- **Other devices:** a group heading, then one [ListRow](../../../packages/ui/src/components/list-row/list-row.md) per platform, the whole row the link. A row names the platform (iPhone & iPad, Android, Windows, Linux (AppImage)) and leaves the verb to its end: the pink button above is the one control worded as an action. A store row ends in ↗ and opens a new tab ([Links that leave Raft](../../patterns/navigation.md#links-that-leave-raft)); an installer row ends in the download icon and stays on the page.
  - On a computer the phones are one row holding the QR code, titled iPhone, iPad and Android, with "Scan with your phone's camera. It opens the App Store or Google Play." A store link opened on a computer can't install anything on a phone. The code encodes this page, so the phone lands on its own store first.
  - On a phone only the other phone platform is listed (iPhone & iPad, or Android with Google Play and the APK). A computer's installer is no use on a phone, so the page leaves them out (huxijin, in a comment on [the mocks](https://app.raft.build/artifacts/FD5q2wj8eB7XA73P79tzRA)).
- **A device the page can't tell** (a Chromebook, an unknown browser, an Android tablet in desktop mode): no This device block and no pink button. "Choose your device." and every platform as a row. A computer whose platform has no build yet is shown the same way, with no line saying it is coming ([Writing](../../content/writing.md#principles)).

The TestFlight beta is not offered: the app is in the App Store (huxijin). Old TestFlight links still work.

Why: the page used to list the App Store, Google Play and the APK first as three equal buttons, then put the computer's pink button at the bottom under a divider, so a Mac's visitor passed three buttons they couldn't use. A phone, its main visitor, got no pink button at all, and the page asked people to choose their device after it had told what it was.

## Settings → About

- **Desktop app** (on the web only; inside the desktop app updates arrive by themselves): one button for this computer's build, the page's one pink button, and every other platform a link under it, this computer's left out, as on the download page. An installer link ends in the download icon.
- **Mobile app:** the phone isn't the device showing Settings, so no platform is recommended and none is pink. On a computer the QR code comes first, with the same sentence as on the download page, then the App Store, Google Play and the APK as one line of links, the stores ending in ↗ and the APK in the download icon. A store button is the way in only when the phone itself is showing Settings (the phone web): that phone's store first, the others as links.
