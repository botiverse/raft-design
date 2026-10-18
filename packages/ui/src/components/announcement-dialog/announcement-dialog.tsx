import { useCallback, useRef } from "react";
import type { ComponentPropsWithRef } from "react";
import { tv } from "../../lib/tv";
import { DialogContent, DialogTitle, DialogClose } from "../dialog/index";
import type { DialogContentProps, DialogTitleProps } from "../dialog/index";
import { Button } from "../button/index";
import type { ButtonProps } from "../button/index";

export {
  Dialog as AnnouncementDialog,
  DialogTrigger as AnnouncementDialogTrigger,
} from "../dialog/index";

const announcement = tv({
  slots: {
    content: ["@container/announcement max-w-xl gap-0 overflow-clip p-0"],
    body: [
      "min-h-0 max-h-[70dvh] overflow-y-auto pb-5",
      "[&_[data-slot=announcement-picture]+[data-slot=announcement-text]]:mt-5",
      "px-5 pt-5",
    ],
    header: ["flex min-w-0 items-center justify-between gap-3"],
    label: [
      "flex min-w-0 items-center gap-2 wrap-break-word",
      "text-caption text-foreground-muted",
    ],
    dot: [
      "shrink-0",
      "size-[9px] rounded-[2px] border-[1.5px] border-sticker-ink bg-attention-400",
    ],
    title: ["mt-3 wrap-break-word normal-case", "text-headline font-bold tracking-normal"],
    picture: [
      "mt-5 h-44 w-full overflow-hidden border border-line-hairline [&_img]:size-full  [&_img]:object-contain",
      "rounded-container bg-fill-muted",
    ],
    text: [
      "mt-3 min-w-0 wrap-break-word [&_p+p]:mt-3",
      "[&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_h1]:text-xl [&_h2]:text-lg [&_h3]:text-base [&_h1]:font-bold [&_h2]:font-bold [&_h3]:font-bold [&_pre]:max-w-full [&_pre]:overflow-x-auto",
      "text-subhead text-foreground-muted",
    ],
    footer: [
      "flex shrink-0 flex-wrap items-center justify-between gap-3 border-line-hairline py-4 @max-[28rem]/announcement:flex-col",
      "border-t-0 px-5 pt-0 pb-5",
    ],
    action: [
      "ml-auto h-auto min-h-8 min-w-0 max-w-full py-1 whitespace-normal text-center font-bold @max-[28rem]/announcement:ml-0 @max-[28rem]/announcement:w-full",
    ],
    secondary: [
      "min-w-0 max-w-full px-0 whitespace-normal underline @max-[28rem]/announcement:w-full",
    ],
  },
});

export function AnnouncementDialogContent({
  className,
  initialFocus,
  ref,
  ...props
}: DialogContentProps) {
  const localRef = useRef<HTMLDivElement | null>(null);
  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      localRef.current = node;
      if (typeof ref === "function") return ref(node);
      if (ref) ref.current = node;
    },
    [ref],
  );
  const focusAction = useCallback(
    () =>
      localRef.current?.querySelector<HTMLElement>("[data-announcement-action]:not(:disabled)") ??
      true,
    [],
  );
  const { content } = announcement();
  return (
    <DialogContent
      ref={setRef}
      initialFocus={initialFocus ?? focusAction}
      className={content({ className })}
      {...props}
    />
  );
}

export function AnnouncementDialogBody({ className, ...props }: ComponentPropsWithRef<"div">) {
  const { body } = announcement();
  return <div data-slot="announcement-body" className={body({ className })} {...props} />;
}
export function AnnouncementDialogHeader({ className, ...props }: ComponentPropsWithRef<"div">) {
  const { header } = announcement();
  return <div data-slot="announcement-header" className={header({ className })} {...props} />;
}
export function AnnouncementDialogLabel({
  className,
  children,
  ...props
}: ComponentPropsWithRef<"div">) {
  const { label, dot } = announcement();
  return (
    <div data-slot="announcement-label" className={label({ className })} {...props}>
      <span aria-hidden="true" className={dot()} />
      {children}
    </div>
  );
}
export function AnnouncementDialogTitle({ className, ...props }: DialogTitleProps) {
  const { title } = announcement();
  return <DialogTitle className={title({ className })} {...props} />;
}
export { DialogClose as AnnouncementDialogClose };
export function AnnouncementDialogPicture({ className, ...props }: ComponentPropsWithRef<"div">) {
  const { picture } = announcement();
  return <div data-slot="announcement-picture" className={picture({ className })} {...props} />;
}
export function AnnouncementDialogText({ className, ...props }: ComponentPropsWithRef<"div">) {
  const { text } = announcement();
  return <div data-slot="announcement-text" className={text({ className })} {...props} />;
}
export function AnnouncementDialogFooter({ className, ...props }: ComponentPropsWithRef<"div">) {
  const { footer } = announcement();
  return <div data-slot="announcement-footer" className={footer({ className })} {...props} />;
}
export function AnnouncementDialogAction({ className, ...props }: Omit<ButtonProps, "variant">) {
  const { action } = announcement();
  return (
    <Button
      variant="accent"
      data-announcement-action
      className={action({ className })}
      {...props}
    />
  );
}
export function AnnouncementDialogSecondaryAction({
  className,
  ...props
}: Omit<ButtonProps, "variant">) {
  const { secondary } = announcement();
  return <Button variant="link" className={secondary({ className })} {...props} />;
}
