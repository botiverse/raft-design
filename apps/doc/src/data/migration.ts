export type MigrationComponentGuide = {
  component: string;
  componentLabel: string;
  refs: readonly string[];
  docsHref: string;
  migration: readonly string[];
  write: string | null;
  noDirect?: readonly string[];
};

export type MigrationGuide = {
  sourceFile: string;
  slug: string;
  components: readonly MigrationComponentGuide[];
};

export const MIGRATION_GUIDES = [
  {
    sourceFile: "packages/web/src/components/ui/Button.tsx",
    slug: "components-ui-button",
    components: [
      {
        component: "button",
        componentLabel: "Button",
        refs: ["legacy BUTTON_TONE_CLASSES"],
        docsHref: "/components/button#variants",
        migration: [
          "Supported `tone` values -> `variant`.",
          "`yellow` -> `primary`; `white` -> `outline`; `cyan` -> `information`; `stone` -> `muted`; `pink` -> `accent`; `orange` -> `warning`; `red` -> `danger`.",
          "`lavender` / `lime` are palette-only tones, not Button variants.",
          "If the color means state, migrate to `Badge` / `Status` instead of `Button`.",
          "If it must stay a button, keep `Button` and preserve the old color with local `className`.",
        ],
        write:
          '<Button variant="primary">Ready</Button>\n<Button className="bg-brutal-lavender text-black hover:bg-brutal-lavender">Review</Button>\n<Button className="bg-brutal-lime text-black hover:bg-brutal-lime">Ready</Button>',
        noDirect: [
          'Do not add public `variant="lavender"` or `variant="lime"`.',
          'Use `className="bg-brutal-lavender text-black hover:bg-brutal-lavender"` for a one-off lavender button.',
          'Use `className="bg-brutal-lime text-black hover:bg-brutal-lime"` for a one-off lime button.',
        ],
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/AnnouncementModal.tsx",
    slug: "components-announcementmodal",
    components: [
      {
        component: "status",
        componentLabel: "Status",
        refs: ["170"],
        docsHref: "/components/status#source-comparison",
        migration: [
          "`Status` replaces attention/status dots and small state labels.",
          "`tone` -> `variant`.",
          "Use `pulse` only for live/activity state.",
        ],
        write: '<Status variant="success">Online</Status>',
      },
      {
        component: "text",
        componentLabel: "Text",
        refs: ["122,139,157-159"],
        docsHref: "/components/text#source-comparison",
        migration: [
          "Loose prose -> `Text.Sans` / `TextSans`.",
          'Use `variant="placeholder"` for slightly gray body copy.',
          "Use heading/mono variants only when semantic.",
        ],
        write: '<Text.Sans size="body" variant="placeholder">Copy</Text.Sans>',
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/ConfirmDialog.tsx",
    slug: "components-confirmdialog",
    components: [
      {
        component: "banner",
        componentLabel: "Banner",
        refs: ["70,80"],
        docsHref: "/components/banner#source-comparison",
        migration: [
          "`Banner` replaces warning/info callouts.",
          "`tone` / alert intent -> `status`.",
          "Compose title, description, and actions with `BannerTitle`, `BannerDescription`, `BannerAction`.",
        ],
        write:
          '<Banner status="warning"><BannerTitle>Heads up</BannerTitle><BannerDescription>Copy</BannerDescription></Banner>',
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/ImageLightbox.tsx",
    slug: "components-imagelightbox",
    components: [
      {
        component: "button",
        componentLabel: "Button",
        refs: ["136,144"],
        docsHref: "/components/button#source-comparison",
        migration: [
          "`Button` replaces legacy local button imports.",
          '`shape="icon"` -> `size="icon-sm"`.',
          '`shape="iconText"` -> normal text plus icon child with `data-icon`.',
          "`tone` -> semantic `variant`.",
          "`title` used as the label -> `aria-label`.",
        ],
        write: '<Button size="icon-sm" aria-label="Download"><Download /></Button>',
        noDirect: [
          "No public `lavender` / `lime` Button variant.",
          "If the source requires the old brutal color, pass local `className` with `bg-brutal-lavender` or `bg-brutal-lime` plus matching hover class.",
        ],
      },
      {
        component: "spinner",
        componentLabel: "Spinner",
        refs: ["194"],
        docsHref: "/components/spinner#source-comparison",
        migration: [
          "`Spinner` replaces loading glyphs.",
          'Use `size` for scale and `variant="inverse"` on dark chrome.',
          "Keep loading text outside when text is visible.",
        ],
        write: '<Spinner size="sm" aria-label="Loading" />',
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/InlineBadgeEditor.tsx",
    slug: "components-inlinebadgeeditor",
    components: [
      {
        component: "combobox",
        componentLabel: "Combobox",
        refs: ["209"],
        docsHref: "/components/combobox#source-comparison-selection-popover",
        migration: [
          "Searchable option list -> `Combobox`.",
          "`value` / filter text stay controlled.",
          "Render badges as `ComboboxItem` rows.",
        ],
        write: `<Combobox items={items} value={value} onValueChange={setValue}>
  <ComboboxTrigger />
  <ComboboxContent>
    <ComboboxInput />
    <ComboboxList>
      {(item) => (
        <ComboboxItem value={item}>
          {item.label}
        </ComboboxItem>
      )}
    </ComboboxList>
  </ComboboxContent>
</Combobox>`,
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/Select.tsx",
    slug: "components-select",
    components: [
      {
        component: "dropdown-menu",
        componentLabel: "Dropdown Menu",
        refs: ["80"],
        docsHref: "/components/dropdown-menu#source-comparison",
        migration: [
          "`DropdownMenu` replaces trigger menus and option lists.",
          "Use `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`.",
          "Use `Select` instead when the value is a form field.",
        ],
        write: `<DropdownMenu>
  <DropdownMenuTrigger render={trigger} />
  <DropdownMenuContent>
    <DropdownMenuItem>Open</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`,
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/actions/ActionCard.tsx",
    slug: "components-actions-actioncard",
    components: [
      {
        component: "banner",
        componentLabel: "Banner",
        refs: ["304"],
        docsHref: "/components/banner#source-comparison",
        migration: [
          "`Banner` replaces warning/info callouts.",
          "`tone` / alert intent -> `status`.",
          "Compose title, description, and actions with `BannerTitle`, `BannerDescription`, `BannerAction`.",
        ],
        write:
          '<Banner status="warning"><BannerTitle>Heads up</BannerTitle><BannerDescription>Copy</BannerDescription></Banner>',
      },
      {
        component: "text",
        componentLabel: "Text",
        refs: ["280,285,291,431-502"],
        docsHref: "/components/text#source-comparison",
        migration: [
          "Loose prose -> `Text.Sans` / `TextSans`.",
          'Use `variant="placeholder"` for slightly gray body copy.',
          "Use heading/mono variants only when semantic.",
        ],
        write: '<Text.Sans size="body" variant="placeholder">Copy</Text.Sans>',
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/agent/AgentActivityDot.tsx",
    slug: "components-agent-agentactivitydot",
    components: [
      {
        component: "status",
        componentLabel: "Status",
        refs: ["24"],
        docsHref: "/components/status#source-comparison",
        migration: [
          "`Status` replaces attention/status dots and small state labels.",
          "`tone` -> `variant`.",
          "Use `pulse` only for live/activity state.",
        ],
        write: '<Status variant="success">Online</Status>',
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/agent/AgentActivityLog.tsx",
    slug: "components-agent-agentactivitylog",
    components: [
      {
        component: "empty-state",
        componentLabel: "Empty State",
        refs: ["328"],
        docsHref: "/components/empty-state#source-comparison",
        migration: [
          "`EmptyState` replaces blank/loading-result panels.",
          "Compose icon, title, description, and actions explicitly.",
          "Keep app-specific retry/load handlers outside.",
        ],
        write:
          "<EmptyState><EmptyStateTitle>No results</EmptyStateTitle><EmptyStateDescription>Try another filter.</EmptyStateDescription></EmptyState>",
      },
      {
        component: "status",
        componentLabel: "Status",
        refs: ["63,96,116,152,188,228,249"],
        docsHref: "/components/status#source-comparison",
        migration: [
          "`Status` replaces attention/status dots and small state labels.",
          "`tone` -> `variant`.",
          "Use `pulse` only for live/activity state.",
        ],
        write: '<Status variant="success">Online</Status>',
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/agent/AgentDetailPanel.tsx",
    slug: "components-agent-agentdetailpanel",
    components: [
      {
        component: "avatar",
        componentLabel: "Avatar",
        refs: ["980,987,1189,1297,1767,1773"],
        docsHref: "/components/avatar#source-comparison",
        migration: [
          "`AvatarSlot` / identity avatar -> `Avatar`, `AvatarImage`, `AvatarFallback`.",
          "Keep user lookup and initials in the app layer.",
          "Use `AvatarGroup` for stacked identities.",
        ],
        write:
          "<Avatar><AvatarImage src={src} alt={name} /><AvatarFallback>{initials}</AvatarFallback></Avatar>",
        noDirect: [
          "No identity resolver API. Resolve `src`, `name`, and `initials` before rendering.",
        ],
      },
      {
        component: "banner",
        componentLabel: "Banner",
        refs: ["179,246"],
        docsHref: "/components/banner#source-comparison",
        migration: [
          "`Banner` replaces warning/info callouts.",
          "`tone` / alert intent -> `status`.",
          "Compose title, description, and actions with `BannerTitle`, `BannerDescription`, `BannerAction`.",
        ],
        write:
          '<Banner status="warning"><BannerTitle>Heads up</BannerTitle><BannerDescription>Copy</BannerDescription></Banner>',
      },
      {
        component: "empty-state",
        componentLabel: "Empty State",
        refs: ["186"],
        docsHref: "/components/empty-state#source-comparison",
        migration: [
          "`EmptyState` replaces blank/loading-result panels.",
          "Compose icon, title, description, and actions explicitly.",
          "Keep app-specific retry/load handlers outside.",
        ],
        write:
          "<EmptyState><EmptyStateTitle>No results</EmptyStateTitle><EmptyStateDescription>Try another filter.</EmptyStateDescription></EmptyState>",
      },
      {
        component: "input",
        componentLabel: "Input",
        refs: ["354,366,800,1810"],
        docsHref: "/components/input#source-comparison",
        migration: [
          "`Input` replaces local styled input shells.",
          "Keep native props: `type`, `value`, `onChange`, `disabled`, `aria-invalid`.",
          "Use `suppressPasswordManager` only for password-manager overlays.",
        ],
        write: "<Input value={value} onChange={onChange} aria-invalid={hasError} />",
      },
      {
        component: "label",
        componentLabel: "Label",
        refs: ["1797"],
        docsHref: "/components/label#source-comparison",
        migration: [
          "`Label` replaces form label text.",
          "Required marker -> `LabelAsterisk`.",
          "Optional/custom suffix -> `LabelOptional` or `LabelSub`.",
        ],
        write: "<Label>Email <LabelAsterisk /></Label>",
      },
      {
        component: "status",
        componentLabel: "Status",
        refs: ["951,1206,1233,1708"],
        docsHref: "/components/status#source-comparison",
        migration: [
          "`Status` replaces attention/status dots and small state labels.",
          "`tone` -> `variant`.",
          "Use `pulse` only for live/activity state.",
        ],
        write: '<Status variant="success">Online</Status>',
      },
      {
        component: "textarea",
        componentLabel: "Textarea",
        refs: ["876"],
        docsHref: "/components/textarea#source-comparison",
        migration: [
          "`Textarea` replaces local textarea shells.",
          "Use `TextareaGroup` and `TextareaCounter` only when count chrome is needed.",
          "Keep autosize/state logic in the app layer.",
        ],
        write: "<Textarea value={value} onChange={onChange} aria-invalid={hasError} />",
        noDirect: ["No old wrapper API. Compose `TextareaGroup` + `TextareaCounter`."],
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/agent/AgentRemindersSection.tsx",
    slug: "components-agent-agentreminderssection",
    components: [
      {
        component: "banner",
        componentLabel: "Banner",
        refs: ["129"],
        docsHref: "/components/banner#source-comparison",
        migration: [
          "`Banner` replaces warning/info callouts.",
          "`tone` / alert intent -> `status`.",
          "Compose title, description, and actions with `BannerTitle`, `BannerDescription`, `BannerAction`.",
        ],
        write:
          '<Banner status="warning"><BannerTitle>Heads up</BannerTitle><BannerDescription>Copy</BannerDescription></Banner>',
      },
      {
        component: "empty-state",
        componentLabel: "Empty State",
        refs: ["146"],
        docsHref: "/components/empty-state#source-comparison",
        migration: [
          "`EmptyState` replaces blank/loading-result panels.",
          "Compose icon, title, description, and actions explicitly.",
          "Keep app-specific retry/load handlers outside.",
        ],
        write:
          "<EmptyState><EmptyStateTitle>No results</EmptyStateTitle><EmptyStateDescription>Try another filter.</EmptyStateDescription></EmptyState>",
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/agent/AgentScopesPanel.tsx",
    slug: "components-agent-agentscopespanel",
    components: [
      {
        component: "banner",
        componentLabel: "Banner",
        refs: ["121,176"],
        docsHref: "/components/banner#source-comparison",
        migration: [
          "`Banner` replaces warning/info callouts.",
          "`tone` / alert intent -> `status`.",
          "Compose title, description, and actions with `BannerTitle`, `BannerDescription`, `BannerAction`.",
        ],
        write:
          '<Banner status="warning"><BannerTitle>Heads up</BannerTitle><BannerDescription>Copy</BannerDescription></Banner>',
      },
      {
        component: "checkbox",
        componentLabel: "Checkbox",
        refs: ["149"],
        docsHref: "/components/checkbox#source-comparison",
        migration: [
          "`Checkbox` replaces custom check markers and native checkbox styling.",
          "Keep `checked`, `defaultChecked`, `disabled`, and `onCheckedChange`.",
          "Labels stay outside in `Label` / `Field` composition.",
        ],
        write: "<Checkbox checked={checked} onCheckedChange={setChecked} />",
      },
      {
        component: "label",
        componentLabel: "Label",
        refs: ["145"],
        docsHref: "/components/label#source-comparison",
        migration: [
          "`Label` replaces form label text.",
          "Required marker -> `LabelAsterisk`.",
          "Optional/custom suffix -> `LabelOptional` or `LabelSub`.",
        ],
        write: "<Label>Email <LabelAsterisk /></Label>",
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/agent/AgentWorkspace.tsx",
    slug: "components-agent-agentworkspace",
    components: [
      {
        component: "spinner",
        componentLabel: "Spinner",
        refs: ["92"],
        docsHref: "/components/spinner#source-comparison",
        migration: [
          "`Spinner` replaces loading glyphs.",
          'Use `size` for scale and `variant="inverse"` on dark chrome.',
          "Keep loading text outside when text is visible.",
        ],
        write: '<Spinner size="sm" aria-label="Loading" />',
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/agent/ChannelMembers.tsx",
    slug: "components-agent-channelmembers",
    components: [
      {
        component: "avatar",
        componentLabel: "Avatar",
        refs: ["291,315"],
        docsHref: "/components/avatar#source-comparison",
        migration: [
          "`AvatarSlot` / identity avatar -> `Avatar`, `AvatarImage`, `AvatarFallback`.",
          "Keep user lookup and initials in the app layer.",
          "Use `AvatarGroup` for stacked identities.",
        ],
        write:
          "<Avatar><AvatarImage src={src} alt={name} /><AvatarFallback>{initials}</AvatarFallback></Avatar>",
        noDirect: [
          "No identity resolver API. Resolve `src`, `name`, and `initials` before rendering.",
        ],
      },
      {
        component: "button",
        componentLabel: "Button",
        refs: ["107"],
        docsHref: "/components/button#source-comparison",
        migration: [
          "`Button` replaces legacy local button imports.",
          '`shape="icon"` -> `size="icon-sm"`.',
          '`shape="iconText"` -> normal text plus icon child with `data-icon`.',
          "`tone` -> semantic `variant`.",
          "`title` used as the label -> `aria-label`.",
        ],
        write: '<Button size="icon-sm" aria-label="Download"><Download /></Button>',
        noDirect: [
          "No public `lavender` / `lime` Button variant.",
          "If the source requires the old brutal color, pass local `className` with `bg-brutal-lavender` or `bg-brutal-lime` plus matching hover class.",
        ],
      },
      {
        component: "field",
        componentLabel: "Field",
        refs: ["262"],
        docsHref: "/components/field#source-comparison",
        migration: [
          "`FormField` / loose form rows -> `Field`.",
          "Use `FieldLabel`, `FieldControl`, `FieldDescription`, `FieldError`.",
          "Set invalid state on the control with `aria-invalid`.",
        ],
        write:
          "<Field><FieldLabel>Email</FieldLabel><FieldControl><Input /></FieldControl><FieldError>Error</FieldError></Field>",
      },
      {
        component: "input",
        componentLabel: "Input",
        refs: ["265"],
        docsHref: "/components/input#source-comparison",
        migration: [
          "`Input` replaces local styled input shells.",
          "Keep native props: `type`, `value`, `onChange`, `disabled`, `aria-invalid`.",
          "Use `suppressPasswordManager` only for password-manager overlays.",
        ],
        write: "<Input value={value} onChange={onChange} aria-invalid={hasError} />",
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/agent/CreateAgentDialog.tsx",
    slug: "components-agent-createagentdialog",
    components: [
      {
        component: "banner",
        componentLabel: "Banner",
        refs: ["320"],
        docsHref: "/components/banner#source-comparison",
        migration: [
          "`Banner` replaces warning/info callouts.",
          "`tone` / alert intent -> `status`.",
          "Compose title, description, and actions with `BannerTitle`, `BannerDescription`, `BannerAction`.",
        ],
        write:
          '<Banner status="warning"><BannerTitle>Heads up</BannerTitle><BannerDescription>Copy</BannerDescription></Banner>',
      },
      {
        component: "field",
        componentLabel: "Field",
        refs: ["340,387,415"],
        docsHref: "/components/field#source-comparison",
        migration: [
          "`FormField` / loose form rows -> `Field`.",
          "Use `FieldLabel`, `FieldControl`, `FieldDescription`, `FieldError`.",
          "Set invalid state on the control with `aria-invalid`.",
        ],
        write:
          "<Field><FieldLabel>Email</FieldLabel><FieldControl><Input /></FieldControl><FieldError>Error</FieldError></Field>",
      },
      {
        component: "input",
        componentLabel: "Input",
        refs: ["400"],
        docsHref: "/components/input#source-comparison",
        migration: [
          "`Input` replaces local styled input shells.",
          "Keep native props: `type`, `value`, `onChange`, `disabled`, `aria-invalid`.",
          "Use `suppressPasswordManager` only for password-manager overlays.",
        ],
        write: "<Input value={value} onChange={onChange} aria-invalid={hasError} />",
      },
      {
        component: "textarea",
        componentLabel: "Textarea",
        refs: ["416"],
        docsHref: "/components/textarea#source-comparison",
        migration: [
          "`Textarea` replaces local textarea shells.",
          "Use `TextareaGroup` and `TextareaCounter` only when count chrome is needed.",
          "Keep autosize/state logic in the app layer.",
        ],
        write: "<Textarea value={value} onChange={onChange} aria-invalid={hasError} />",
        noDirect: ["No old wrapper API. Compose `TextareaGroup` + `TextareaCounter`."],
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/agent/ReportIssueDialog.tsx",
    slug: "components-agent-reportissuedialog",
    components: [
      {
        component: "banner",
        componentLabel: "Banner",
        refs: ["334,350"],
        docsHref: "/components/banner#source-comparison",
        migration: [
          "`Banner` replaces warning/info callouts.",
          "`tone` / alert intent -> `status`.",
          "Compose title, description, and actions with `BannerTitle`, `BannerDescription`, `BannerAction`.",
        ],
        write:
          '<Banner status="warning"><BannerTitle>Heads up</BannerTitle><BannerDescription>Copy</BannerDescription></Banner>',
      },
      {
        component: "checkbox",
        componentLabel: "Checkbox",
        refs: ["308,316,324,340"],
        docsHref: "/components/checkbox#source-comparison",
        migration: [
          "`Checkbox` replaces custom check markers and native checkbox styling.",
          "Keep `checked`, `defaultChecked`, `disabled`, and `onCheckedChange`.",
          "Labels stay outside in `Label` / `Field` composition.",
        ],
        write: "<Checkbox checked={checked} onCheckedChange={setChecked} />",
      },
      {
        component: "field",
        componentLabel: "Field",
        refs: ["293"],
        docsHref: "/components/field#source-comparison",
        migration: [
          "`FormField` / loose form rows -> `Field`.",
          "Use `FieldLabel`, `FieldControl`, `FieldDescription`, `FieldError`.",
          "Set invalid state on the control with `aria-invalid`.",
        ],
        write:
          "<Field><FieldLabel>Email</FieldLabel><FieldControl><Input /></FieldControl><FieldError>Error</FieldError></Field>",
      },
      {
        component: "label",
        componentLabel: "Label",
        refs: ["307,315,323,339"],
        docsHref: "/components/label#source-comparison",
        migration: [
          "`Label` replaces form label text.",
          "Required marker -> `LabelAsterisk`.",
          "Optional/custom suffix -> `LabelOptional` or `LabelSub`.",
        ],
        write: "<Label>Email <LabelAsterisk /></Label>",
      },
      {
        component: "textarea",
        componentLabel: "Textarea",
        refs: ["294"],
        docsHref: "/components/textarea#source-comparison",
        migration: [
          "`Textarea` replaces local textarea shells.",
          "Use `TextareaGroup` and `TextareaCounter` only when count chrome is needed.",
          "Keep autosize/state logic in the app layer.",
        ],
        write: "<Textarea value={value} onChange={onChange} aria-invalid={hasError} />",
        noDirect: ["No old wrapper API. Compose `TextareaGroup` + `TextareaCounter`."],
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/agent/ResetAgentDialog.tsx",
    slug: "components-agent-resetagentdialog",
    components: [
      {
        component: "banner",
        componentLabel: "Banner",
        refs: ["71,95"],
        docsHref: "/components/banner#source-comparison",
        migration: [
          "`Banner` replaces warning/info callouts.",
          "`tone` / alert intent -> `status`.",
          "Compose title, description, and actions with `BannerTitle`, `BannerDescription`, `BannerAction`.",
        ],
        write:
          '<Banner status="warning"><BannerTitle>Heads up</BannerTitle><BannerDescription>Copy</BannerDescription></Banner>',
      },
      {
        component: "radio-group",
        componentLabel: "Radio Group",
        refs: ["83,94,113,117"],
        docsHref: "/components/radio-group#source-comparison",
        migration: [
          "`RadioGroup` replaces card/list radio choices.",
          "Each option is a `RadioGroupItem` with a `RadioGroupIndicator`.",
          "Put long descriptions beside the item, not in the primitive state.",
        ],
        write:
          '<RadioGroup value={value} onValueChange={setValue}><RadioGroupItem value="safe"><RadioGroupIndicator /></RadioGroupItem></RadioGroup>',
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/agent/RuntimeConfigFields.tsx",
    slug: "components-agent-runtimeconfigfields",
    components: [
      {
        component: "checkbox",
        componentLabel: "Checkbox",
        refs: ["317"],
        docsHref: "/components/checkbox#source-comparison",
        migration: [
          "`Checkbox` replaces custom check markers and native checkbox styling.",
          "Keep `checked`, `defaultChecked`, `disabled`, and `onCheckedChange`.",
          "Labels stay outside in `Label` / `Field` composition.",
        ],
        write: "<Checkbox checked={checked} onCheckedChange={setChecked} />",
      },
      {
        component: "field",
        componentLabel: "Field",
        refs: ["73,172,182,207,221,295,315"],
        docsHref: "/components/field#source-comparison",
        migration: [
          "`FormField` / loose form rows -> `Field`.",
          "Use `FieldLabel`, `FieldControl`, `FieldDescription`, `FieldError`.",
          "Set invalid state on the control with `aria-invalid`.",
        ],
        write:
          "<Field><FieldLabel>Email</FieldLabel><FieldControl><Input /></FieldControl><FieldError>Error</FieldError></Field>",
      },
      {
        component: "input",
        componentLabel: "Input",
        refs: ["78,90,208,222,273"],
        docsHref: "/components/input#source-comparison",
        migration: [
          "`Input` replaces local styled input shells.",
          "Keep native props: `type`, `value`, `onChange`, `disabled`, `aria-invalid`.",
          "Use `suppressPasswordManager` only for password-manager overlays.",
        ],
        write: "<Input value={value} onChange={onChange} aria-invalid={hasError} />",
      },
      {
        component: "label",
        componentLabel: "Label",
        refs: ["241,316"],
        docsHref: "/components/label#source-comparison",
        migration: [
          "`Label` replaces form label text.",
          "Required marker -> `LabelAsterisk`.",
          "Optional/custom suffix -> `LabelOptional` or `LabelSub`.",
        ],
        write: "<Label>Email <LabelAsterisk /></Label>",
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/auth/EmailVerificationPage.tsx",
    slug: "components-auth-emailverificationpage",
    components: [
      {
        component: "banner",
        componentLabel: "Banner",
        refs: ["102"],
        docsHref: "/components/banner#source-comparison",
        migration: [
          "`Banner` replaces warning/info callouts.",
          "`tone` / alert intent -> `status`.",
          "Compose title, description, and actions with `BannerTitle`, `BannerDescription`, `BannerAction`.",
        ],
        write:
          '<Banner status="warning"><BannerTitle>Heads up</BannerTitle><BannerDescription>Copy</BannerDescription></Banner>',
      },
      {
        component: "input",
        componentLabel: "Input",
        refs: ["143"],
        docsHref: "/components/input#source-comparison",
        migration: [
          "`Input` replaces local styled input shells.",
          "Keep native props: `type`, `value`, `onChange`, `disabled`, `aria-invalid`.",
          "Use `suppressPasswordManager` only for password-manager overlays.",
        ],
        write: "<Input value={value} onChange={onChange} aria-invalid={hasError} />",
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/auth/ForgotPasswordPage.tsx",
    slug: "components-auth-forgotpasswordpage",
    components: [
      {
        component: "banner",
        componentLabel: "Banner",
        refs: ["64"],
        docsHref: "/components/banner#source-comparison",
        migration: [
          "`Banner` replaces warning/info callouts.",
          "`tone` / alert intent -> `status`.",
          "Compose title, description, and actions with `BannerTitle`, `BannerDescription`, `BannerAction`.",
        ],
        write:
          '<Banner status="warning"><BannerTitle>Heads up</BannerTitle><BannerDescription>Copy</BannerDescription></Banner>',
      },
      {
        component: "field",
        componentLabel: "Field",
        refs: ["68"],
        docsHref: "/components/field#source-comparison",
        migration: [
          "`FormField` / loose form rows -> `Field`.",
          "Use `FieldLabel`, `FieldControl`, `FieldDescription`, `FieldError`.",
          "Set invalid state on the control with `aria-invalid`.",
        ],
        write:
          "<Field><FieldLabel>Email</FieldLabel><FieldControl><Input /></FieldControl><FieldError>Error</FieldError></Field>",
      },
      {
        component: "input",
        componentLabel: "Input",
        refs: ["69"],
        docsHref: "/components/input#source-comparison",
        migration: [
          "`Input` replaces local styled input shells.",
          "Keep native props: `type`, `value`, `onChange`, `disabled`, `aria-invalid`.",
          "Use `suppressPasswordManager` only for password-manager overlays.",
        ],
        write: "<Input value={value} onChange={onChange} aria-invalid={hasError} />",
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/auth/InviteAcceptPage.tsx",
    slug: "components-auth-inviteacceptpage",
    components: [
      {
        component: "banner",
        componentLabel: "Banner",
        refs: ["204"],
        docsHref: "/components/banner#source-comparison",
        migration: [
          "`Banner` replaces warning/info callouts.",
          "`tone` / alert intent -> `status`.",
          "Compose title, description, and actions with `BannerTitle`, `BannerDescription`, `BannerAction`.",
        ],
        write:
          '<Banner status="warning"><BannerTitle>Heads up</BannerTitle><BannerDescription>Copy</BannerDescription></Banner>',
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/auth/LegalAcceptanceCheckbox.tsx",
    slug: "components-auth-legalacceptancecheckbox",
    components: [
      {
        component: "checkbox",
        componentLabel: "Checkbox",
        refs: ["16"],
        docsHref: "/components/checkbox#source-comparison",
        migration: [
          "`Checkbox` replaces custom check markers and native checkbox styling.",
          "Keep `checked`, `defaultChecked`, `disabled`, and `onCheckedChange`.",
          "Labels stay outside in `Label` / `Field` composition.",
        ],
        write: "<Checkbox checked={checked} onCheckedChange={setChecked} />",
      },
      {
        component: "label",
        componentLabel: "Label",
        refs: ["15"],
        docsHref: "/components/label#source-comparison",
        migration: [
          "`Label` replaces form label text.",
          "Required marker -> `LabelAsterisk`.",
          "Optional/custom suffix -> `LabelOptional` or `LabelSub`.",
        ],
        write: "<Label>Email <LabelAsterisk /></Label>",
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/auth/LoginPage.tsx",
    slug: "components-auth-loginpage",
    components: [
      {
        component: "banner",
        componentLabel: "Banner",
        refs: ["109"],
        docsHref: "/components/banner#source-comparison",
        migration: [
          "`Banner` replaces warning/info callouts.",
          "`tone` / alert intent -> `status`.",
          "Compose title, description, and actions with `BannerTitle`, `BannerDescription`, `BannerAction`.",
        ],
        write:
          '<Banner status="warning"><BannerTitle>Heads up</BannerTitle><BannerDescription>Copy</BannerDescription></Banner>',
      },
      {
        component: "field",
        componentLabel: "Field",
        refs: ["113,125"],
        docsHref: "/components/field#source-comparison",
        migration: [
          "`FormField` / loose form rows -> `Field`.",
          "Use `FieldLabel`, `FieldControl`, `FieldDescription`, `FieldError`.",
          "Set invalid state on the control with `aria-invalid`.",
        ],
        write:
          "<Field><FieldLabel>Email</FieldLabel><FieldControl><Input /></FieldControl><FieldError>Error</FieldError></Field>",
      },
      {
        component: "input",
        componentLabel: "Input",
        refs: ["114,126"],
        docsHref: "/components/input#source-comparison",
        migration: [
          "`Input` replaces local styled input shells.",
          "Keep native props: `type`, `value`, `onChange`, `disabled`, `aria-invalid`.",
          "Use `suppressPasswordManager` only for password-manager overlays.",
        ],
        write: "<Input value={value} onChange={onChange} aria-invalid={hasError} />",
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/auth/RegisterPage.tsx",
    slug: "components-auth-registerpage",
    components: [
      {
        component: "banner",
        componentLabel: "Banner",
        refs: ["66"],
        docsHref: "/components/banner#source-comparison",
        migration: [
          "`Banner` replaces warning/info callouts.",
          "`tone` / alert intent -> `status`.",
          "Compose title, description, and actions with `BannerTitle`, `BannerDescription`, `BannerAction`.",
        ],
        write:
          '<Banner status="warning"><BannerTitle>Heads up</BannerTitle><BannerDescription>Copy</BannerDescription></Banner>',
      },
      {
        component: "field",
        componentLabel: "Field",
        refs: ["70,83,95"],
        docsHref: "/components/field#source-comparison",
        migration: [
          "`FormField` / loose form rows -> `Field`.",
          "Use `FieldLabel`, `FieldControl`, `FieldDescription`, `FieldError`.",
          "Set invalid state on the control with `aria-invalid`.",
        ],
        write:
          "<Field><FieldLabel>Email</FieldLabel><FieldControl><Input /></FieldControl><FieldError>Error</FieldError></Field>",
      },
      {
        component: "input",
        componentLabel: "Input",
        refs: ["71,84,96"],
        docsHref: "/components/input#source-comparison",
        migration: [
          "`Input` replaces local styled input shells.",
          "Keep native props: `type`, `value`, `onChange`, `disabled`, `aria-invalid`.",
          "Use `suppressPasswordManager` only for password-manager overlays.",
        ],
        write: "<Input value={value} onChange={onChange} aria-invalid={hasError} />",
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/auth/ResetPasswordPage.tsx",
    slug: "components-auth-resetpasswordpage",
    components: [
      {
        component: "banner",
        componentLabel: "Banner",
        refs: ["78"],
        docsHref: "/components/banner#source-comparison",
        migration: [
          "`Banner` replaces warning/info callouts.",
          "`tone` / alert intent -> `status`.",
          "Compose title, description, and actions with `BannerTitle`, `BannerDescription`, `BannerAction`.",
        ],
        write:
          '<Banner status="warning"><BannerTitle>Heads up</BannerTitle><BannerDescription>Copy</BannerDescription></Banner>',
      },
      {
        component: "field",
        componentLabel: "Field",
        refs: ["82,95"],
        docsHref: "/components/field#source-comparison",
        migration: [
          "`FormField` / loose form rows -> `Field`.",
          "Use `FieldLabel`, `FieldControl`, `FieldDescription`, `FieldError`.",
          "Set invalid state on the control with `aria-invalid`.",
        ],
        write:
          "<Field><FieldLabel>Email</FieldLabel><FieldControl><Input /></FieldControl><FieldError>Error</FieldError></Field>",
      },
      {
        component: "input",
        componentLabel: "Input",
        refs: ["83,96"],
        docsHref: "/components/input#source-comparison",
        migration: [
          "`Input` replaces local styled input shells.",
          "Keep native props: `type`, `value`, `onChange`, `disabled`, `aria-invalid`.",
          "Use `suppressPasswordManager` only for password-manager overlays.",
        ],
        write: "<Input value={value} onChange={onChange} aria-invalid={hasError} />",
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/auth/ServerSelector.tsx",
    slug: "components-auth-serverselector",
    components: [
      {
        component: "banner",
        componentLabel: "Banner",
        refs: ["56"],
        docsHref: "/components/banner#source-comparison",
        migration: [
          "`Banner` replaces warning/info callouts.",
          "`tone` / alert intent -> `status`.",
          "Compose title, description, and actions with `BannerTitle`, `BannerDescription`, `BannerAction`.",
        ],
        write:
          '<Banner status="warning"><BannerTitle>Heads up</BannerTitle><BannerDescription>Copy</BannerDescription></Banner>',
      },
      {
        component: "field",
        componentLabel: "Field",
        refs: ["60,74"],
        docsHref: "/components/field#source-comparison",
        migration: [
          "`FormField` / loose form rows -> `Field`.",
          "Use `FieldLabel`, `FieldControl`, `FieldDescription`, `FieldError`.",
          "Set invalid state on the control with `aria-invalid`.",
        ],
        write:
          "<Field><FieldLabel>Email</FieldLabel><FieldControl><Input /></FieldControl><FieldError>Error</FieldError></Field>",
      },
      {
        component: "input",
        componentLabel: "Input",
        refs: ["61"],
        docsHref: "/components/input#source-comparison",
        migration: [
          "`Input` replaces local styled input shells.",
          "Keep native props: `type`, `value`, `onChange`, `disabled`, `aria-invalid`.",
          "Use `suppressPasswordManager` only for password-manager overlays.",
        ],
        write: "<Input value={value} onChange={onChange} aria-invalid={hasError} />",
      },
      {
        component: "input-group",
        componentLabel: "Input Group",
        refs: ["75"],
        docsHref: "/components/input-group#source-comparison",
        migration: [
          "Search/slug input wrappers -> `InputGroup`.",
          "Use `InputGroupAddon` for icons or prefixes.",
          "Use `InputGroupInput` for the actual input.",
        ],
        write:
          "<InputGroup><InputGroupAddon><Search /></InputGroupAddon><InputGroupInput /></InputGroup>",
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/auth/SocialAuthCallbackPage.tsx",
    slug: "components-auth-socialauthcallbackpage",
    components: [
      {
        component: "banner",
        componentLabel: "Banner",
        refs: ["141,161"],
        docsHref: "/components/banner#source-comparison",
        migration: [
          "`Banner` replaces warning/info callouts.",
          "`tone` / alert intent -> `status`.",
          "Compose title, description, and actions with `BannerTitle`, `BannerDescription`, `BannerAction`.",
        ],
        write:
          '<Banner status="warning"><BannerTitle>Heads up</BannerTitle><BannerDescription>Copy</BannerDescription></Banner>',
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/channel/AddMembersDialog.tsx",
    slug: "components-channel-addmembersdialog",
    components: [
      {
        component: "banner",
        componentLabel: "Banner",
        refs: ["231"],
        docsHref: "/components/banner#source-comparison",
        migration: [
          "`Banner` replaces warning/info callouts.",
          "`tone` / alert intent -> `status`.",
          "Compose title, description, and actions with `BannerTitle`, `BannerDescription`, `BannerAction`.",
        ],
        write:
          '<Banner status="warning"><BannerTitle>Heads up</BannerTitle><BannerDescription>Copy</BannerDescription></Banner>',
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/channel/ChannelMemberList.tsx",
    slug: "components-channel-channelmemberlist",
    components: [
      {
        component: "avatar",
        componentLabel: "Avatar",
        refs: ["60"],
        docsHref: "/components/avatar#source-comparison",
        migration: [
          "`AvatarSlot` / identity avatar -> `Avatar`, `AvatarImage`, `AvatarFallback`.",
          "Keep user lookup and initials in the app layer.",
          "Use `AvatarGroup` for stacked identities.",
        ],
        write:
          "<Avatar><AvatarImage src={src} alt={name} /><AvatarFallback>{initials}</AvatarFallback></Avatar>",
        noDirect: [
          "No identity resolver API. Resolve `src`, `name`, and `initials` before rendering.",
        ],
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/channel/CreateChannelDialog.tsx",
    slug: "components-channel-createchanneldialog",
    components: [
      {
        component: "avatar",
        componentLabel: "Avatar",
        refs: ["323,349"],
        docsHref: "/components/avatar#source-comparison",
        migration: [
          "`AvatarSlot` / identity avatar -> `Avatar`, `AvatarImage`, `AvatarFallback`.",
          "Keep user lookup and initials in the app layer.",
          "Use `AvatarGroup` for stacked identities.",
        ],
        write:
          "<Avatar><AvatarImage src={src} alt={name} /><AvatarFallback>{initials}</AvatarFallback></Avatar>",
        noDirect: [
          "No identity resolver API. Resolve `src`, `name`, and `initials` before rendering.",
        ],
      },
      {
        component: "banner",
        componentLabel: "Banner",
        refs: ["222,227"],
        docsHref: "/components/banner#source-comparison",
        migration: [
          "`Banner` replaces warning/info callouts.",
          "`tone` / alert intent -> `status`.",
          "Compose title, description, and actions with `BannerTitle`, `BannerDescription`, `BannerAction`.",
        ],
        write:
          '<Banner status="warning"><BannerTitle>Heads up</BannerTitle><BannerDescription>Copy</BannerDescription></Banner>',
      },
      {
        component: "field",
        componentLabel: "Field",
        refs: ["260,271,280,291"],
        docsHref: "/components/field#source-comparison",
        migration: [
          "`FormField` / loose form rows -> `Field`.",
          "Use `FieldLabel`, `FieldControl`, `FieldDescription`, `FieldError`.",
          "Set invalid state on the control with `aria-invalid`.",
        ],
        write:
          "<Field><FieldLabel>Email</FieldLabel><FieldControl><Input /></FieldControl><FieldError>Error</FieldError></Field>",
      },
      {
        component: "input",
        componentLabel: "Input",
        refs: ["261,296"],
        docsHref: "/components/input#source-comparison",
        migration: [
          "`Input` replaces local styled input shells.",
          "Keep native props: `type`, `value`, `onChange`, `disabled`, `aria-invalid`.",
          "Use `suppressPasswordManager` only for password-manager overlays.",
        ],
        write: "<Input value={value} onChange={onChange} aria-invalid={hasError} />",
      },
      {
        component: "textarea",
        componentLabel: "Textarea",
        refs: ["272"],
        docsHref: "/components/textarea#source-comparison",
        migration: [
          "`Textarea` replaces local textarea shells.",
          "Use `TextareaGroup` and `TextareaCounter` only when count chrome is needed.",
          "Keep autosize/state logic in the app layer.",
        ],
        write: "<Textarea value={value} onChange={onChange} aria-invalid={hasError} />",
        noDirect: ["No old wrapper API. Compose `TextareaGroup` + `TextareaCounter`."],
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/channel/CreateJointChannelDialog.tsx",
    slug: "components-channel-createjointchanneldialog",
    components: [
      {
        component: "avatar",
        componentLabel: "Avatar",
        refs: ["276,301"],
        docsHref: "/components/avatar#source-comparison",
        migration: [
          "`AvatarSlot` / identity avatar -> `Avatar`, `AvatarImage`, `AvatarFallback`.",
          "Keep user lookup and initials in the app layer.",
          "Use `AvatarGroup` for stacked identities.",
        ],
        write:
          "<Avatar><AvatarImage src={src} alt={name} /><AvatarFallback>{initials}</AvatarFallback></Avatar>",
        noDirect: [
          "No identity resolver API. Resolve `src`, `name`, and `initials` before rendering.",
        ],
      },
      {
        component: "banner",
        componentLabel: "Banner",
        refs: ["164,169"],
        docsHref: "/components/banner#source-comparison",
        migration: [
          "`Banner` replaces warning/info callouts.",
          "`tone` / alert intent -> `status`.",
          "Compose title, description, and actions with `BannerTitle`, `BannerDescription`, `BannerAction`.",
        ],
        write:
          '<Banner status="warning"><BannerTitle>Heads up</BannerTitle><BannerDescription>Copy</BannerDescription></Banner>',
      },
      {
        component: "field",
        componentLabel: "Field",
        refs: ["196,208,218,231,245"],
        docsHref: "/components/field#source-comparison",
        migration: [
          "`FormField` / loose form rows -> `Field`.",
          "Use `FieldLabel`, `FieldControl`, `FieldDescription`, `FieldError`.",
          "Set invalid state on the control with `aria-invalid`.",
        ],
        write:
          "<Field><FieldLabel>Email</FieldLabel><FieldControl><Input /></FieldControl><FieldError>Error</FieldError></Field>",
      },
      {
        component: "input",
        componentLabel: "Input",
        refs: ["197,250"],
        docsHref: "/components/input#source-comparison",
        migration: [
          "`Input` replaces local styled input shells.",
          "Keep native props: `type`, `value`, `onChange`, `disabled`, `aria-invalid`.",
          "Use `suppressPasswordManager` only for password-manager overlays.",
        ],
        write: "<Input value={value} onChange={onChange} aria-invalid={hasError} />",
      },
      {
        component: "input-group",
        componentLabel: "Input Group",
        refs: ["219"],
        docsHref: "/components/input-group#source-comparison",
        migration: [
          "Search/slug input wrappers -> `InputGroup`.",
          "Use `InputGroupAddon` for icons or prefixes.",
          "Use `InputGroupInput` for the actual input.",
        ],
        write:
          "<InputGroup><InputGroupAddon><Search /></InputGroupAddon><InputGroupInput /></InputGroup>",
      },
      {
        component: "textarea",
        componentLabel: "Textarea",
        refs: ["209,232"],
        docsHref: "/components/textarea#source-comparison",
        migration: [
          "`Textarea` replaces local textarea shells.",
          "Use `TextareaGroup` and `TextareaCounter` only when count chrome is needed.",
          "Keep autosize/state logic in the app layer.",
        ],
        write: "<Textarea value={value} onChange={onChange} aria-invalid={hasError} />",
        noDirect: ["No old wrapper API. Compose `TextareaGroup` + `TextareaCounter`."],
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/channel/EditChannelDialog.tsx",
    slug: "components-channel-editchanneldialog",
    components: [
      {
        component: "banner",
        componentLabel: "Banner",
        refs: ["139"],
        docsHref: "/components/banner#source-comparison",
        migration: [
          "`Banner` replaces warning/info callouts.",
          "`tone` / alert intent -> `status`.",
          "Compose title, description, and actions with `BannerTitle`, `BannerDescription`, `BannerAction`.",
        ],
        write:
          '<Banner status="warning"><BannerTitle>Heads up</BannerTitle><BannerDescription>Copy</BannerDescription></Banner>',
      },
      {
        component: "field",
        componentLabel: "Field",
        refs: ["143,165"],
        docsHref: "/components/field#source-comparison",
        migration: [
          "`FormField` / loose form rows -> `Field`.",
          "Use `FieldLabel`, `FieldControl`, `FieldDescription`, `FieldError`.",
          "Set invalid state on the control with `aria-invalid`.",
        ],
        write:
          "<Field><FieldLabel>Email</FieldLabel><FieldControl><Input /></FieldControl><FieldError>Error</FieldError></Field>",
      },
      {
        component: "input",
        componentLabel: "Input",
        refs: ["154"],
        docsHref: "/components/input#source-comparison",
        migration: [
          "`Input` replaces local styled input shells.",
          "Keep native props: `type`, `value`, `onChange`, `disabled`, `aria-invalid`.",
          "Use `suppressPasswordManager` only for password-manager overlays.",
        ],
        write: "<Input value={value} onChange={onChange} aria-invalid={hasError} />",
      },
      {
        component: "textarea",
        componentLabel: "Textarea",
        refs: ["166"],
        docsHref: "/components/textarea#source-comparison",
        migration: [
          "`Textarea` replaces local textarea shells.",
          "Use `TextareaGroup` and `TextareaCounter` only when count chrome is needed.",
          "Keep autosize/state logic in the app layer.",
        ],
        write: "<Textarea value={value} onChange={onChange} aria-invalid={hasError} />",
        noDirect: ["No old wrapper API. Compose `TextareaGroup` + `TextareaCounter`."],
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/layout/LeftRail.tsx",
    slug: "components-layout-leftrail",
    components: [
      {
        component: "dropdown-menu",
        componentLabel: "Dropdown Menu",
        refs: ["110"],
        docsHref: "/components/dropdown-menu#source-comparison",
        migration: [
          "`DropdownMenu` replaces trigger menus and option lists.",
          "Use `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`.",
          "Use `Select` instead when the value is a form field.",
        ],
        write:
          "<DropdownMenu><DropdownMenuTrigger render={trigger} /><DropdownMenuContent><DropdownMenuItem>Open</DropdownMenuItem></DropdownMenuContent></DropdownMenu>",
      },
      {
        component: "notification-center",
        componentLabel: "Notification Center",
        refs: ["162"],
        docsHref: "/components/notification-center#source-comparison",
        migration: [
          "`NotificationCenter` replaces notification popover shells.",
          "Use `NotificationCenterTrigger`, `NotificationCenterPopup`, `NotificationCenterItem`.",
          "Keep notification fetching/read state in the app layer.",
        ],
        write:
          "<NotificationCenter><NotificationCenterTrigger render={trigger} /><NotificationCenterPopup>...</NotificationCenterPopup></NotificationCenter>",
        noDirect: ["No data store API. Pass already-loaded notifications as children."],
      },
      {
        component: "popover",
        componentLabel: "Popover",
        refs: ["162"],
        docsHref: "/components/popover#source-comparison",
        migration: [
          "`Popover` replaces hover/click floating panels.",
          "Use `PopoverTrigger`, `PopoverContent`, `PopoverTitle`, `PopoverDescription`.",
          "Keep async loading and domain rendering in the app layer.",
        ],
        write:
          "<Popover><PopoverTrigger render={trigger} /><PopoverContent><PopoverTitle>Details</PopoverTitle></PopoverContent></Popover>",
      },
      {
        component: "status",
        componentLabel: "Status",
        refs: ["101,222"],
        docsHref: "/components/status#source-comparison",
        migration: [
          "`Status` replaces attention/status dots and small state labels.",
          "`tone` -> `variant`.",
          "Use `pulse` only for live/activity state.",
        ],
        write: '<Status variant="success">Online</Status>',
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/layout/LiveAgentActivityBar.tsx",
    slug: "components-layout-liveagentactivitybar",
    components: [
      {
        component: "live-agent-activity-bar",
        componentLabel: "LiveAgentActivityBar",
        refs: ["7-64"],
        docsHref: "/components/live-agent-activity-bar#source-comparison",
        migration: [
          "Use `LiveAgentActivityBar` for the avatar, pulsing live status, truncating activity copy, and source sidebar/mobile surfaces.",
          "Pass only the active `thinking` or `working` item; render nothing when no live item exists.",
          "Resolve source `pixel:key` identities in the app and pass the rendered avatar through `avatar`; use `agentAvatarSrc` only for a real image URL or data URL.",
          "Keep socket subscriptions, latest-item selection, terminal-state removal, and the 90-second expiry lifecycle in the app layer.",
        ],
        write:
          '<LiveAgentActivityBar activity={latest.activity} avatar={<AgentAvatar avatarUrl={latest.agentAvatarUrl} className="!size-full" />}>{latest.text}</LiveAgentActivityBar>',
        noDirect: [
          "No store, socket, timer, or activity-normalization API is bundled with the UI component.",
          "Do not pass source `pixel:key` values to `agentAvatarSrc`; keep identity resolution in the app layer.",
        ],
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/layout/NotificationCenter.tsx",
    slug: "components-layout-notificationcenter",
    components: [
      {
        component: "notification-center",
        componentLabel: "Notification Center",
        refs: [],
        docsHref: "/components/notification-center#source-comparison",
        migration: [
          "`NotificationCenter` replaces notification popover shells.",
          "Use `NotificationCenterTrigger`, `NotificationCenterPopup`, `NotificationCenterItem`.",
          "Keep notification fetching/read state in the app layer.",
        ],
        write:
          "<NotificationCenter><NotificationCenterTrigger render={trigger} /><NotificationCenterPopup>...</NotificationCenterPopup></NotificationCenter>",
        noDirect: ["No data store API. Pass already-loaded notifications as children."],
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/layout/NotificationTrigger.tsx",
    slug: "components-layout-notificationtrigger",
    components: [
      {
        component: "notification-center",
        componentLabel: "Notification Center",
        refs: ["125,165"],
        docsHref: "/components/notification-center#source-comparison",
        migration: [
          "`NotificationCenter` replaces notification popover shells.",
          "Use `NotificationCenterTrigger`, `NotificationCenterPopup`, `NotificationCenterItem`.",
          "Keep notification fetching/read state in the app layer.",
        ],
        write:
          "<NotificationCenter><NotificationCenterTrigger render={trigger} /><NotificationCenterPopup>...</NotificationCenterPopup></NotificationCenter>",
        noDirect: ["No data store API. Pass already-loaded notifications as children."],
      },
      {
        component: "popover",
        componentLabel: "Popover",
        refs: ["58,126,166"],
        docsHref: "/components/popover#source-comparison",
        migration: [
          "`Popover` replaces hover/click floating panels.",
          "Use `PopoverTrigger`, `PopoverContent`, `PopoverTitle`, `PopoverDescription`.",
          "Keep async loading and domain rendering in the app layer.",
        ],
        write:
          "<Popover><PopoverTrigger render={trigger} /><PopoverContent><PopoverTitle>Details</PopoverTitle></PopoverContent></Popover>",
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/layout/OwnerOnboardingModal.tsx",
    slug: "components-layout-owneronboardingmodal",
    components: [
      {
        component: "checkbox",
        componentLabel: "Checkbox",
        refs: ["1120"],
        docsHref: "/components/checkbox#source-comparison",
        migration: [
          "`Checkbox` replaces custom check markers and native checkbox styling.",
          "Keep `checked`, `defaultChecked`, `disabled`, and `onCheckedChange`.",
          "Labels stay outside in `Label` / `Field` composition.",
        ],
        write: "<Checkbox checked={checked} onCheckedChange={setChecked} />",
      },
      {
        component: "input",
        componentLabel: "Input",
        refs: ["936,1070"],
        docsHref: "/components/input#source-comparison",
        migration: [
          "`Input` replaces local styled input shells.",
          "Keep native props: `type`, `value`, `onChange`, `disabled`, `aria-invalid`.",
          "Use `suppressPasswordManager` only for password-manager overlays.",
        ],
        write: "<Input value={value} onChange={onChange} aria-invalid={hasError} />",
      },
      {
        component: "label",
        componentLabel: "Label",
        refs: ["1045,1067,1119"],
        docsHref: "/components/label#source-comparison",
        migration: [
          "`Label` replaces form label text.",
          "Required marker -> `LabelAsterisk`.",
          "Optional/custom suffix -> `LabelOptional` or `LabelSub`.",
        ],
        write: "<Label>Email <LabelAsterisk /></Label>",
      },
      {
        component: "radio-group",
        componentLabel: "Radio Group",
        refs: ["914"],
        docsHref: "/components/radio-group#source-comparison",
        migration: [
          "`RadioGroup` replaces card/list radio choices.",
          "Each option is a `RadioGroupItem` with a `RadioGroupIndicator`.",
          "Put long descriptions beside the item, not in the primitive state.",
        ],
        write:
          '<RadioGroup value={value} onValueChange={setValue}><RadioGroupItem value="safe"><RadioGroupIndicator /></RadioGroupItem></RadioGroup>',
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/layout/Sidebar.tsx",
    slug: "components-layout-sidebar",
    components: [
      {
        component: "avatar",
        componentLabel: "Avatar",
        refs: ["1072,1106,1145,1644,1646,1857"],
        docsHref: "/components/avatar#source-comparison",
        migration: [
          "`AvatarSlot` / identity avatar -> `Avatar`, `AvatarImage`, `AvatarFallback`.",
          "Keep user lookup and initials in the app layer.",
          "Use `AvatarGroup` for stacked identities.",
        ],
        write:
          "<Avatar><AvatarImage src={src} alt={name} /><AvatarFallback>{initials}</AvatarFallback></Avatar>",
        noDirect: [
          "No identity resolver API. Resolve `src`, `name`, and `initials` before rendering.",
        ],
      },
      {
        component: "banner",
        componentLabel: "Banner",
        refs: ["1934"],
        docsHref: "/components/banner#source-comparison",
        migration: [
          "`Banner` replaces warning/info callouts.",
          "`tone` / alert intent -> `status`.",
          "Compose title, description, and actions with `BannerTitle`, `BannerDescription`, `BannerAction`.",
        ],
        write:
          '<Banner status="warning"><BannerTitle>Heads up</BannerTitle><BannerDescription>Copy</BannerDescription></Banner>',
      },
      {
        component: "context-menu",
        componentLabel: "Context Menu",
        refs: [
          "807,818,1158,2040,2051,2052,2077,2089,2090,2113,2122,2123,2141,2152,2153,2172,2200,2216,2217,2230,2252,2263,2264",
        ],
        docsHref: "/components/context-menu#source-comparison",
        migration: [
          "`ContextMenu` replaces right-click menus.",
          "Wrap the target with `ContextMenuTrigger`.",
          "Use `ContextMenuItem`, `ContextMenuSeparator`, `ContextMenuShortcut`.",
        ],
        write:
          "<ContextMenu><ContextMenuTrigger render={target} /><ContextMenuContent><ContextMenuItem>Copy</ContextMenuItem></ContextMenuContent></ContextMenu>",
      },
      {
        component: "dropdown-menu",
        componentLabel: "Dropdown Menu",
        refs: ["751,1242"],
        docsHref: "/components/dropdown-menu#source-comparison",
        migration: [
          "`DropdownMenu` replaces trigger menus and option lists.",
          "Use `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`.",
          "Use `Select` instead when the value is a form field.",
        ],
        write:
          "<DropdownMenu><DropdownMenuTrigger render={trigger} /><DropdownMenuContent><DropdownMenuItem>Open</DropdownMenuItem></DropdownMenuContent></DropdownMenu>",
      },
      {
        component: "notification-center",
        componentLabel: "Notification Center",
        refs: ["1226"],
        docsHref: "/components/notification-center#source-comparison",
        migration: [
          "`NotificationCenter` replaces notification popover shells.",
          "Use `NotificationCenterTrigger`, `NotificationCenterPopup`, `NotificationCenterItem`.",
          "Keep notification fetching/read state in the app layer.",
        ],
        write:
          "<NotificationCenter><NotificationCenterTrigger render={trigger} /><NotificationCenterPopup>...</NotificationCenterPopup></NotificationCenter>",
        noDirect: ["No data store API. Pass already-loaded notifications as children."],
      },
      {
        component: "popover",
        componentLabel: "Popover",
        refs: ["1226"],
        docsHref: "/components/popover#source-comparison",
        migration: [
          "`Popover` replaces hover/click floating panels.",
          "Use `PopoverTrigger`, `PopoverContent`, `PopoverTitle`, `PopoverDescription`.",
          "Keep async loading and domain rendering in the app layer.",
        ],
        write:
          "<Popover><PopoverTrigger render={trigger} /><PopoverContent><PopoverTitle>Details</PopoverTitle></PopoverContent></Popover>",
      },
      {
        component: "status",
        componentLabel: "Status",
        refs: ["1080,1152,1364,1673", "1212,1481,1532,1575,1705"],
        docsHref: "/components/status#source-comparison",
        migration: [
          "`Status` replaces attention/status dots and small state labels.",
          "`tone` -> `variant`.",
          "Use `pulse` only for live/activity state.",
        ],
        write: '<Status variant="success">Online</Status>',
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/machine/AddMachineDialog.tsx",
    slug: "components-machine-addmachinedialog",
    components: [
      {
        component: "banner",
        componentLabel: "Banner",
        refs: ["167,284"],
        docsHref: "/components/banner#source-comparison",
        migration: [
          "`Banner` replaces warning/info callouts.",
          "`tone` / alert intent -> `status`.",
          "Compose title, description, and actions with `BannerTitle`, `BannerDescription`, `BannerAction`.",
        ],
        write:
          '<Banner status="warning"><BannerTitle>Heads up</BannerTitle><BannerDescription>Copy</BannerDescription></Banner>',
      },
      {
        component: "field",
        componentLabel: "Field",
        refs: ["330"],
        docsHref: "/components/field#source-comparison",
        migration: [
          "`FormField` / loose form rows -> `Field`.",
          "Use `FieldLabel`, `FieldControl`, `FieldDescription`, `FieldError`.",
          "Set invalid state on the control with `aria-invalid`.",
        ],
        write:
          "<Field><FieldLabel>Email</FieldLabel><FieldControl><Input /></FieldControl><FieldError>Error</FieldError></Field>",
      },
      {
        component: "input",
        componentLabel: "Input",
        refs: ["335"],
        docsHref: "/components/input#source-comparison",
        migration: [
          "`Input` replaces local styled input shells.",
          "Keep native props: `type`, `value`, `onChange`, `disabled`, `aria-invalid`.",
          "Use `suppressPasswordManager` only for password-manager overlays.",
        ],
        write: "<Input value={value} onChange={onChange} aria-invalid={hasError} />",
      },
      {
        component: "status",
        componentLabel: "Status",
        refs: ["287"],
        docsHref: "/components/status#source-comparison",
        migration: [
          "`Status` replaces attention/status dots and small state labels.",
          "`tone` -> `variant`.",
          "Use `pulse` only for live/activity state.",
        ],
        write: '<Status variant="success">Online</Status>',
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/machine/MachineDetailPanel.tsx",
    slug: "components-machine-machinedetailpanel",
    components: [
      {
        component: "banner",
        componentLabel: "Banner",
        refs: ["98,414,530,952"],
        docsHref: "/components/banner#source-comparison",
        migration: [
          "`Banner` replaces warning/info callouts.",
          "`tone` / alert intent -> `status`.",
          "Compose title, description, and actions with `BannerTitle`, `BannerDescription`, `BannerAction`.",
        ],
        write:
          '<Banner status="warning"><BannerTitle>Heads up</BannerTitle><BannerDescription>Copy</BannerDescription></Banner>',
      },
      {
        component: "input",
        componentLabel: "Input",
        refs: ["732"],
        docsHref: "/components/input#source-comparison",
        migration: [
          "`Input` replaces local styled input shells.",
          "Keep native props: `type`, `value`, `onChange`, `disabled`, `aria-invalid`.",
          "Use `suppressPasswordManager` only for password-manager overlays.",
        ],
        write: "<Input value={value} onChange={onChange} aria-invalid={hasError} />",
      },
      {
        component: "status",
        componentLabel: "Status",
        refs: ["426,699"],
        docsHref: "/components/status#source-comparison",
        migration: [
          "`Status` replaces attention/status dots and small state labels.",
          "`tone` -> `variant`.",
          "Use `pulse` only for live/activity state.",
        ],
        write: '<Status variant="success">Online</Status>',
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/machine/MobileComputersPanel.tsx",
    slug: "components-machine-mobilecomputerspanel",
    components: [
      {
        component: "button",
        componentLabel: "Button",
        refs: ["49"],
        docsHref: "/components/button#source-comparison",
        migration: [
          "`Button` replaces legacy local button imports.",
          '`shape="icon"` -> `size="icon-sm"`.',
          '`shape="iconText"` -> normal text plus icon child with `data-icon`.',
          "`tone` -> semantic `variant`.",
          "`title` used as the label -> `aria-label`.",
        ],
        write: '<Button size="icon-sm" aria-label="Download"><Download /></Button>',
        noDirect: [
          "No public `lavender` / `lime` Button variant.",
          "If the source requires the old brutal color, pass local `className` with `bg-brutal-lavender` or `bg-brutal-lime` plus matching hover class.",
        ],
      },
      {
        component: "empty-state",
        componentLabel: "Empty State",
        refs: ["65"],
        docsHref: "/components/empty-state#source-comparison",
        migration: [
          "`EmptyState` replaces blank/loading-result panels.",
          "Compose icon, title, description, and actions explicitly.",
          "Keep app-specific retry/load handlers outside.",
        ],
        write:
          "<EmptyState><EmptyStateTitle>No results</EmptyStateTitle><EmptyStateDescription>Try another filter.</EmptyStateDescription></EmptyState>",
      },
      {
        component: "status",
        componentLabel: "Status",
        refs: ["86"],
        docsHref: "/components/status#source-comparison",
        migration: [
          "`Status` replaces attention/status dots and small state labels.",
          "`tone` -> `variant`.",
          "Use `pulse` only for live/activity state.",
        ],
        write: '<Status variant="success">Online</Status>',
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/markdown/MermaidDiagram.tsx",
    slug: "components-markdown-mermaiddiagram",
    components: [
      {
        component: "spinner",
        componentLabel: "Spinner",
        refs: ["87"],
        docsHref: "/components/spinner#source-comparison",
        migration: [
          "`Spinner` replaces loading glyphs.",
          'Use `size` for scale and `variant="inverse"` on dark chrome.',
          "Keep loading text outside when text is visible.",
        ],
        write: '<Spinner size="sm" aria-label="Loading" />',
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/member/GravatarAvatar.tsx",
    slug: "components-member-gravataravatar",
    components: [
      {
        component: "avatar",
        componentLabel: "Avatar",
        refs: ["33"],
        docsHref: "/components/avatar#source-comparison",
        migration: [
          "`AvatarSlot` / identity avatar -> `Avatar`, `AvatarImage`, `AvatarFallback`.",
          "Keep user lookup and initials in the app layer.",
          "Use `AvatarGroup` for stacked identities.",
        ],
        write:
          "<Avatar><AvatarImage src={src} alt={name} /><AvatarFallback>{initials}</AvatarFallback></Avatar>",
        noDirect: [
          "No identity resolver API. Resolve `src`, `name`, and `initials` before rendering.",
        ],
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/member/HumanDetailPanel.tsx",
    slug: "components-member-humandetailpanel",
    components: [
      {
        component: "avatar",
        componentLabel: "Avatar",
        refs: ["199,258,264,520"],
        docsHref: "/components/avatar#source-comparison",
        migration: [
          "`AvatarSlot` / identity avatar -> `Avatar`, `AvatarImage`, `AvatarFallback`.",
          "Keep user lookup and initials in the app layer.",
          "Use `AvatarGroup` for stacked identities.",
        ],
        write:
          "<Avatar><AvatarImage src={src} alt={name} /><AvatarFallback>{initials}</AvatarFallback></Avatar>",
        noDirect: [
          "No identity resolver API. Resolve `src`, `name`, and `initials` before rendering.",
        ],
      },
      {
        component: "input",
        componentLabel: "Input",
        refs: ["185"],
        docsHref: "/components/input#source-comparison",
        migration: [
          "`Input` replaces local styled input shells.",
          "Keep native props: `type`, `value`, `onChange`, `disabled`, `aria-invalid`.",
          "Use `suppressPasswordManager` only for password-manager overlays.",
        ],
        write: "<Input value={value} onChange={onChange} aria-invalid={hasError} />",
      },
      {
        component: "status",
        componentLabel: "Status",
        refs: ["523"],
        docsHref: "/components/status#source-comparison",
        migration: [
          "`Status` replaces attention/status dots and small state labels.",
          "`tone` -> `variant`.",
          "Use `pulse` only for live/activity state.",
        ],
        write: '<Status variant="success">Online</Status>',
      },
      {
        component: "text",
        componentLabel: "Text",
        refs: ["267,275,279,319,360,368,374,397,475,481,530"],
        docsHref: "/components/text#source-comparison",
        migration: [
          "Loose prose -> `Text.Sans` / `TextSans`.",
          'Use `variant="placeholder"` for slightly gray body copy.',
          "Use heading/mono variants only when semantic.",
        ],
        write: '<Text.Sans size="body" variant="placeholder">Copy</Text.Sans>',
      },
      {
        component: "textarea",
        componentLabel: "Textarea",
        refs: ["309"],
        docsHref: "/components/textarea#source-comparison",
        migration: [
          "`Textarea` replaces local textarea shells.",
          "Use `TextareaGroup` and `TextareaCounter` only when count chrome is needed.",
          "Keep autosize/state logic in the app layer.",
        ],
        write: "<Textarea value={value} onChange={onChange} aria-invalid={hasError} />",
        noDirect: ["No old wrapper API. Compose `TextareaGroup` + `TextareaCounter`."],
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/member/InviteHumanDialog.tsx",
    slug: "components-member-invitehumandialog",
    components: [
      {
        component: "banner",
        componentLabel: "Banner",
        refs: ["110"],
        docsHref: "/components/banner#source-comparison",
        migration: [
          "`Banner` replaces warning/info callouts.",
          "`tone` / alert intent -> `status`.",
          "Compose title, description, and actions with `BannerTitle`, `BannerDescription`, `BannerAction`.",
        ],
        write:
          '<Banner status="warning"><BannerTitle>Heads up</BannerTitle><BannerDescription>Copy</BannerDescription></Banner>',
      },
      {
        component: "input",
        componentLabel: "Input",
        refs: ["145"],
        docsHref: "/components/input#source-comparison",
        migration: [
          "`Input` replaces local styled input shells.",
          "Keep native props: `type`, `value`, `onChange`, `disabled`, `aria-invalid`.",
          "Use `suppressPasswordManager` only for password-manager overlays.",
        ],
        write: "<Input value={value} onChange={onChange} aria-invalid={hasError} />",
      },
      {
        component: "label",
        componentLabel: "Label",
        refs: ["116,140"],
        docsHref: "/components/label#source-comparison",
        migration: [
          "`Label` replaces form label text.",
          "Required marker -> `LabelAsterisk`.",
          "Optional/custom suffix -> `LabelOptional` or `LabelSub`.",
        ],
        write: "<Label>Email <LabelAsterisk /></Label>",
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/message/AttachmentChip.tsx",
    slug: "components-message-attachmentchip",
    components: [
      {
        component: "spinner",
        componentLabel: "Spinner",
        refs: ["81,103"],
        docsHref: "/components/spinner#source-comparison",
        migration: [
          "`Spinner` replaces loading glyphs.",
          'Use `size` for scale and `variant="inverse"` on dark chrome.',
          "Keep loading text outside when text is visible.",
        ],
        write: '<Spinner size="sm" aria-label="Loading" />',
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/message/ChannelFilesPanel.tsx",
    slug: "components-message-channelfilespanel",
    components: [
      {
        component: "empty-state",
        componentLabel: "Empty State",
        refs: ["254"],
        docsHref: "/components/empty-state#source-comparison",
        migration: [
          "`EmptyState` replaces blank/loading-result panels.",
          "Compose icon, title, description, and actions explicitly.",
          "Keep app-specific retry/load handlers outside.",
        ],
        write:
          "<EmptyState><EmptyStateTitle>No results</EmptyStateTitle><EmptyStateDescription>Try another filter.</EmptyStateDescription></EmptyState>",
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/message/ChatPanel.tsx",
    slug: "components-message-chatpanel",
    components: [
      {
        component: "avatar",
        componentLabel: "Avatar",
        refs: ["663,676"],
        docsHref: "/components/avatar#source-comparison",
        migration: [
          "`AvatarSlot` / identity avatar -> `Avatar`, `AvatarImage`, `AvatarFallback`.",
          "Keep user lookup and initials in the app layer.",
          "Use `AvatarGroup` for stacked identities.",
        ],
        write:
          "<Avatar><AvatarImage src={src} alt={name} /><AvatarFallback>{initials}</AvatarFallback></Avatar>",
        noDirect: [
          "No identity resolver API. Resolve `src`, `name`, and `initials` before rendering.",
        ],
      },
      {
        component: "banner",
        componentLabel: "Banner",
        refs: ["75,498"],
        docsHref: "/components/banner#source-comparison",
        migration: [
          "`Banner` replaces warning/info callouts.",
          "`tone` / alert intent -> `status`.",
          "Compose title, description, and actions with `BannerTitle`, `BannerDescription`, `BannerAction`.",
        ],
        write:
          '<Banner status="warning"><BannerTitle>Heads up</BannerTitle><BannerDescription>Copy</BannerDescription></Banner>',
      },
      {
        component: "button",
        componentLabel: "Button",
        refs: ["695,705,715"],
        docsHref: "/components/button#source-comparison",
        migration: [
          "`Button` replaces legacy local button imports.",
          '`shape="icon"` -> `size="icon-sm"`.',
          '`shape="iconText"` -> normal text plus icon child with `data-icon`.',
          "`tone` -> semantic `variant`.",
          "`title` used as the label -> `aria-label`.",
        ],
        write: '<Button size="icon-sm" aria-label="Download"><Download /></Button>',
        noDirect: [
          "No public `lavender` / `lime` Button variant.",
          "If the source requires the old brutal color, pass local `className` with `bg-brutal-lavender` or `bg-brutal-lime` plus matching hover class.",
        ],
      },
      {
        component: "empty-state",
        componentLabel: "Empty State",
        refs: ["765"],
        docsHref: "/components/empty-state#source-comparison",
        migration: [
          "`EmptyState` replaces blank/loading-result panels.",
          "Compose icon, title, description, and actions explicitly.",
          "Keep app-specific retry/load handlers outside.",
        ],
        write:
          "<EmptyState><EmptyStateTitle>No results</EmptyStateTitle><EmptyStateDescription>Try another filter.</EmptyStateDescription></EmptyState>",
      },
      {
        component: "status",
        componentLabel: "Status",
        refs: ["60"],
        docsHref: "/components/status#source-comparison",
        migration: [
          "`Status` replaces attention/status dots and small state labels.",
          "`tone` -> `variant`.",
          "Use `pulse` only for live/activity state.",
        ],
        write: '<Status variant="success">Online</Status>',
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/message/MentionHoverCard.tsx",
    slug: "components-message-mentionhovercard",
    components: [
      {
        component: "avatar",
        componentLabel: "Avatar",
        refs: ["50,76"],
        docsHref: "/components/avatar#source-comparison",
        migration: [
          "`AvatarSlot` / identity avatar -> `Avatar`, `AvatarImage`, `AvatarFallback`.",
          "Keep user lookup and initials in the app layer.",
          "Use `AvatarGroup` for stacked identities.",
        ],
        write:
          "<Avatar><AvatarImage src={src} alt={name} /><AvatarFallback>{initials}</AvatarFallback></Avatar>",
        noDirect: [
          "No identity resolver API. Resolve `src`, `name`, and `initials` before rendering.",
        ],
      },
      {
        component: "popover",
        componentLabel: "Popover",
        refs: ["35,99,102"],
        docsHref: "/components/popover#source-comparison",
        migration: [
          "`Popover` replaces hover/click floating panels.",
          "Use `PopoverTrigger`, `PopoverContent`, `PopoverTitle`, `PopoverDescription`.",
          "Keep async loading and domain rendering in the app layer.",
        ],
        write:
          "<Popover><PopoverTrigger render={trigger} /><PopoverContent><PopoverTitle>Details</PopoverTitle></PopoverContent></Popover>",
      },
      {
        component: "status",
        componentLabel: "Status",
        refs: ["54"],
        docsHref: "/components/status#source-comparison",
        migration: [
          "`Status` replaces attention/status dots and small state labels.",
          "`tone` -> `variant`.",
          "Use `pulse` only for live/activity state.",
        ],
        write: '<Status variant="success">Online</Status>',
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/message/MessageInput.tsx",
    slug: "components-message-messageinput",
    components: [
      {
        component: "avatar",
        componentLabel: "Avatar",
        refs: ["245,255"],
        docsHref: "/components/avatar#source-comparison",
        migration: [
          "`AvatarSlot` / identity avatar -> `Avatar`, `AvatarImage`, `AvatarFallback`.",
          "Keep user lookup and initials in the app layer.",
          "Use `AvatarGroup` for stacked identities.",
        ],
        write:
          "<Avatar><AvatarImage src={src} alt={name} /><AvatarFallback>{initials}</AvatarFallback></Avatar>",
        noDirect: [
          "No identity resolver API. Resolve `src`, `name`, and `initials` before rendering.",
        ],
      },
      {
        component: "checkbox",
        componentLabel: "Checkbox",
        refs: ["1138"],
        docsHref: "/components/checkbox#source-comparison",
        migration: [
          "`Checkbox` replaces custom check markers and native checkbox styling.",
          "Keep `checked`, `defaultChecked`, `disabled`, and `onCheckedChange`.",
          "Labels stay outside in `Label` / `Field` composition.",
        ],
        write: "<Checkbox checked={checked} onCheckedChange={setChecked} />",
      },
      {
        component: "input",
        componentLabel: "Input",
        refs: ["1032,1044"],
        docsHref: "/components/input#source-comparison",
        migration: [
          "`Input` replaces local styled input shells.",
          "Keep native props: `type`, `value`, `onChange`, `disabled`, `aria-invalid`.",
          "Use `suppressPasswordManager` only for password-manager overlays.",
        ],
        write: "<Input value={value} onChange={onChange} aria-invalid={hasError} />",
      },
      {
        component: "label",
        componentLabel: "Label",
        refs: ["1137"],
        docsHref: "/components/label#source-comparison",
        migration: [
          "`Label` replaces form label text.",
          "Required marker -> `LabelAsterisk`.",
          "Optional/custom suffix -> `LabelOptional` or `LabelSub`.",
        ],
        write: "<Label>Email <LabelAsterisk /></Label>",
      },
      {
        component: "combobox",
        componentLabel: "Combobox",
        refs: ["928"],
        docsHref: "/components/combobox#source-comparison-composer-mention",
        migration: [
          "Mention suggestions -> `Combobox`.",
          "Input text drives filtering.",
          "Use `ComboboxItem` for people/snippets.",
        ],
        write:
          "<Combobox items={mentions} inputValue={query} onInputValueChange={setQuery}><ComboboxContent><ComboboxInput /><ComboboxList>{(item) => <ComboboxItem value={item}>{item.label}</ComboboxItem>}</ComboboxList></ComboboxContent></Combobox>",
      },
      {
        component: "spinner",
        componentLabel: "Spinner",
        refs: ["151,1165"],
        docsHref: "/components/spinner#source-comparison",
        migration: [
          "`Spinner` replaces loading glyphs.",
          'Use `size` for scale and `variant="inverse"` on dark chrome.',
          "Keep loading text outside when text is visible.",
        ],
        write: '<Spinner size="sm" aria-label="Loading" />',
      },
      {
        component: "textarea",
        componentLabel: "Textarea",
        refs: ["1106"],
        docsHref: "/components/textarea#source-comparison",
        migration: [
          "`Textarea` replaces local textarea shells.",
          "Use `TextareaGroup` and `TextareaCounter` only when count chrome is needed.",
          "Keep autosize/state logic in the app layer.",
        ],
        write: "<Textarea value={value} onChange={onChange} aria-invalid={hasError} />",
        noDirect: ["No old wrapper API. Compose `TextareaGroup` + `TextareaCounter`."],
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/message/MessageItem.tsx",
    slug: "components-message-messageitem",
    components: [
      {
        component: "avatar",
        componentLabel: "Avatar",
        refs: ["1302,1328"],
        docsHref: "/components/avatar#source-comparison",
        migration: [
          "`AvatarSlot` / identity avatar -> `Avatar`, `AvatarImage`, `AvatarFallback`.",
          "Keep user lookup and initials in the app layer.",
          "Use `AvatarGroup` for stacked identities.",
        ],
        write:
          "<Avatar><AvatarImage src={src} alt={name} /><AvatarFallback>{initials}</AvatarFallback></Avatar>",
        noDirect: [
          "No identity resolver API. Resolve `src`, `name`, and `initials` before rendering.",
        ],
      },
      {
        component: "banner",
        componentLabel: "Banner",
        refs: ["1108"],
        docsHref: "/components/banner#source-comparison",
        migration: [
          "`Banner` replaces warning/info callouts.",
          "`tone` / alert intent -> `status`.",
          "Compose title, description, and actions with `BannerTitle`, `BannerDescription`, `BannerAction`.",
        ],
        write:
          '<Banner status="warning"><BannerTitle>Heads up</BannerTitle><BannerDescription>Copy</BannerDescription></Banner>',
      },
      {
        component: "button",
        componentLabel: "Button",
        refs: ["953,956"],
        docsHref: "/components/button#source-comparison",
        migration: [
          "`Button` replaces legacy local button imports.",
          '`shape="icon"` -> `size="icon-sm"`.',
          '`shape="iconText"` -> normal text plus icon child with `data-icon`.',
          "`tone` -> semantic `variant`.",
          "`title` used as the label -> `aria-label`.",
        ],
        write: '<Button size="icon-sm" aria-label="Download"><Download /></Button>',
        noDirect: [
          "No public `lavender` / `lime` Button variant.",
          "If the source requires the old brutal color, pass local `className` with `bg-brutal-lavender` or `bg-brutal-lime` plus matching hover class.",
        ],
      },
      {
        component: "context-menu",
        componentLabel: "Context Menu",
        refs: ["2917,2923,2966,2969,2975,3032,3040,3042,3049,3056,3064,3068,3075"],
        docsHref: "/components/context-menu#source-comparison",
        migration: [
          "`ContextMenu` replaces right-click menus.",
          "Wrap the target with `ContextMenuTrigger`.",
          "Use `ContextMenuItem`, `ContextMenuSeparator`, `ContextMenuShortcut`.",
        ],
        write:
          "<ContextMenu><ContextMenuTrigger render={target} /><ContextMenuContent><ContextMenuItem>Copy</ContextMenuItem></ContextMenuContent></ContextMenu>",
      },
      {
        component: "popover",
        componentLabel: "Popover",
        refs: ["2808,2860,2862,2890"],
        docsHref: "/components/popover#source-comparison",
        migration: [
          "`Popover` replaces hover/click floating panels.",
          "Use `PopoverTrigger`, `PopoverContent`, `PopoverTitle`, `PopoverDescription`.",
          "Keep async loading and domain rendering in the app layer.",
        ],
        write:
          "<Popover><PopoverTrigger render={trigger} /><PopoverContent><PopoverTitle>Details</PopoverTitle></PopoverContent></Popover>",
      },
      {
        component: "spinner",
        componentLabel: "Spinner",
        refs: ["579,2584"],
        docsHref: "/components/spinner#source-comparison",
        migration: [
          "`Spinner` replaces loading glyphs.",
          'Use `size` for scale and `variant="inverse"` on dark chrome.',
          "Keep loading text outside when text is visible.",
        ],
        write: '<Spinner size="sm" aria-label="Loading" />',
      },
      {
        component: "status",
        componentLabel: "Status",
        refs: ["1218"],
        docsHref: "/components/status#source-comparison",
        migration: [
          "`Status` replaces attention/status dots and small state labels.",
          "`tone` -> `variant`.",
          "Use `pulse` only for live/activity state.",
        ],
        write: '<Status variant="success">Online</Status>',
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/message/SOSDialog.tsx",
    slug: "components-message-sosdialog",
    components: [
      {
        component: "banner",
        componentLabel: "Banner",
        refs: ["70,96"],
        docsHref: "/components/banner#source-comparison",
        migration: [
          "`Banner` replaces warning/info callouts.",
          "`tone` / alert intent -> `status`.",
          "Compose title, description, and actions with `BannerTitle`, `BannerDescription`, `BannerAction`.",
        ],
        write:
          '<Banner status="warning"><BannerTitle>Heads up</BannerTitle><BannerDescription>Copy</BannerDescription></Banner>',
      },
      {
        component: "textarea",
        componentLabel: "Textarea",
        refs: ["102"],
        docsHref: "/components/textarea#source-comparison",
        migration: [
          "`Textarea` replaces local textarea shells.",
          "Use `TextareaGroup` and `TextareaCounter` only when count chrome is needed.",
          "Keep autosize/state logic in the app layer.",
        ],
        write: "<Textarea value={value} onChange={onChange} aria-invalid={hasError} />",
        noDirect: ["No old wrapper API. Compose `TextareaGroup` + `TextareaCounter`."],
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/message/SelectModeToolbar.tsx",
    slug: "components-message-selectmodetoolbar",
    components: [
      {
        component: "spinner",
        componentLabel: "Spinner",
        refs: ["118"],
        docsHref: "/components/spinner#source-comparison",
        migration: [
          "`Spinner` replaces loading glyphs.",
          'Use `size` for scale and `variant="inverse"` on dark chrome.',
          "Keep loading text outside when text is visible.",
        ],
        write: '<Spinner size="sm" aria-label="Loading" />',
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/message/SelectShareLightbox.tsx",
    slug: "components-message-selectsharelightbox",
    components: [
      {
        component: "button",
        componentLabel: "Button",
        refs: ["37"],
        docsHref: "/components/button#source-comparison",
        migration: [
          "`Button` replaces legacy local button imports.",
          '`shape="icon"` -> `size="icon-sm"`.',
          '`shape="iconText"` -> normal text plus icon child with `data-icon`.',
          "`tone` -> semantic `variant`.",
          "`title` used as the label -> `aria-label`.",
        ],
        write: '<Button size="icon-sm" aria-label="Download"><Download /></Button>',
        noDirect: [
          "No public `lavender` / `lime` Button variant.",
          "If the source requires the old brutal color, pass local `className` with `bg-brutal-lavender` or `bg-brutal-lime` plus matching hover class.",
        ],
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/message/ThreadPanel.tsx",
    slug: "components-message-threadpanel",
    components: [
      {
        component: "empty-state",
        componentLabel: "Empty State",
        refs: ["1080"],
        docsHref: "/components/empty-state#source-comparison",
        migration: [
          "`EmptyState` replaces blank/loading-result panels.",
          "Compose icon, title, description, and actions explicitly.",
          "Keep app-specific retry/load handlers outside.",
        ],
        write:
          "<EmptyState><EmptyStateTitle>No results</EmptyStateTitle><EmptyStateDescription>Try another filter.</EmptyStateDescription></EmptyState>",
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/onboarding/OnboardingStepDialog.tsx",
    slug: "components-onboarding-onboardingstepdialog",
    components: [
      {
        component: "banner",
        componentLabel: "Banner",
        refs: ["55"],
        docsHref: "/components/banner#source-comparison",
        migration: [
          "`Banner` replaces warning/info callouts.",
          "`tone` / alert intent -> `status`.",
          "Compose title, description, and actions with `BannerTitle`, `BannerDescription`, `BannerAction`.",
        ],
        write:
          '<Banner status="warning"><BannerTitle>Heads up</BannerTitle><BannerDescription>Copy</BannerDescription></Banner>',
      },
      {
        component: "text",
        componentLabel: "Text",
        refs: ["77,80,114"],
        docsHref: "/components/text#source-comparison",
        migration: [
          "Loose prose -> `Text.Sans` / `TextSans`.",
          'Use `variant="placeholder"` for slightly gray body copy.',
          "Use heading/mono variants only when semantic.",
        ],
        write: '<Text.Sans size="body" variant="placeholder">Copy</Text.Sans>',
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/saved/SavedPanel.tsx",
    slug: "components-saved-savedpanel",
    components: [
      {
        component: "avatar",
        componentLabel: "Avatar",
        refs: ["120,122"],
        docsHref: "/components/avatar#source-comparison",
        migration: [
          "`AvatarSlot` / identity avatar -> `Avatar`, `AvatarImage`, `AvatarFallback`.",
          "Keep user lookup and initials in the app layer.",
          "Use `AvatarGroup` for stacked identities.",
        ],
        write:
          "<Avatar><AvatarImage src={src} alt={name} /><AvatarFallback>{initials}</AvatarFallback></Avatar>",
        noDirect: [
          "No identity resolver API. Resolve `src`, `name`, and `initials` before rendering.",
        ],
      },
      {
        component: "context-menu",
        componentLabel: "Context Menu",
        refs: ["151,157,163,164"],
        docsHref: "/components/context-menu#source-comparison",
        migration: [
          "`ContextMenu` replaces right-click menus.",
          "Wrap the target with `ContextMenuTrigger`.",
          "Use `ContextMenuItem`, `ContextMenuSeparator`, `ContextMenuShortcut`.",
        ],
        write:
          "<ContextMenu><ContextMenuTrigger render={target} /><ContextMenuContent><ContextMenuItem>Copy</ContextMenuItem></ContextMenuContent></ContextMenu>",
      },
      {
        component: "empty-state",
        componentLabel: "Empty State",
        refs: ["207"],
        docsHref: "/components/empty-state#source-comparison",
        migration: [
          "`EmptyState` replaces blank/loading-result panels.",
          "Compose icon, title, description, and actions explicitly.",
          "Keep app-specific retry/load handlers outside.",
        ],
        write:
          "<EmptyState><EmptyStateTitle>No results</EmptyStateTitle><EmptyStateDescription>Try another filter.</EmptyStateDescription></EmptyState>",
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/search/MessageSearchPage.tsx",
    slug: "components-search-messagesearchpage",
    components: [
      {
        component: "combobox",
        componentLabel: "Combobox",
        refs: ["742", "816"],
        docsHref: "/components/combobox#source-comparison",
        migration: [
          "`Combobox` replaces searchable filter dropdowns.",
          "Use `ComboboxControl`, `ComboboxInput`, `ComboboxContent`, `ComboboxItem`.",
          "Keep query/filtering and selected item data in the app layer.",
        ],
        write: "<Combobox items={items} value={value} onValueChange={setValue}>...</Combobox>",
        noDirect: ["No app-specific channel/member filtering API. Provide filtered `items`."],
      },
      {
        component: "dropdown-menu",
        componentLabel: "Dropdown Menu",
        refs: ["863"],
        docsHref: "/components/dropdown-menu#source-comparison",
        migration: [
          "`DropdownMenu` replaces trigger menus and option lists.",
          "Use `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`.",
          "Use `Select` instead when the value is a form field.",
        ],
        write:
          "<DropdownMenu><DropdownMenuTrigger render={trigger} /><DropdownMenuContent><DropdownMenuItem>Open</DropdownMenuItem></DropdownMenuContent></DropdownMenu>",
      },
      {
        component: "input",
        componentLabel: "Input",
        refs: ["697"],
        docsHref: "/components/input#source-comparison",
        migration: [
          "`Input` replaces local styled input shells.",
          "Keep native props: `type`, `value`, `onChange`, `disabled`, `aria-invalid`.",
          "Use `suppressPasswordManager` only for password-manager overlays.",
        ],
        write: "<Input value={value} onChange={onChange} aria-invalid={hasError} />",
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/server/CommunityAgreementDialog.tsx",
    slug: "components-server-communityagreementdialog",
    components: [
      {
        component: "banner",
        componentLabel: "Banner",
        refs: ["64"],
        docsHref: "/components/banner#source-comparison",
        migration: [
          "`Banner` replaces warning/info callouts.",
          "`tone` / alert intent -> `status`.",
          "Compose title, description, and actions with `BannerTitle`, `BannerDescription`, `BannerAction`.",
        ],
        write:
          '<Banner status="warning"><BannerTitle>Heads up</BannerTitle><BannerDescription>Copy</BannerDescription></Banner>',
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/settings/MemberGraphSection.tsx",
    slug: "components-settings-membergraphsection",
    components: [
      {
        component: "avatar",
        componentLabel: "Avatar",
        refs: ["110,119,174,181"],
        docsHref: "/components/avatar#source-comparison",
        migration: [
          "`AvatarSlot` / identity avatar -> `Avatar`, `AvatarImage`, `AvatarFallback`.",
          "Keep user lookup and initials in the app layer.",
          "Use `AvatarGroup` for stacked identities.",
        ],
        write:
          "<Avatar><AvatarImage src={src} alt={name} /><AvatarFallback>{initials}</AvatarFallback></Avatar>",
        noDirect: [
          "No identity resolver API. Resolve `src`, `name`, and `initials` before rendering.",
        ],
      },
      {
        component: "banner",
        componentLabel: "Banner",
        refs: ["704"],
        docsHref: "/components/banner#source-comparison",
        migration: [
          "`Banner` replaces warning/info callouts.",
          "`tone` / alert intent -> `status`.",
          "Compose title, description, and actions with `BannerTitle`, `BannerDescription`, `BannerAction`.",
        ],
        write:
          '<Banner status="warning"><BannerTitle>Heads up</BannerTitle><BannerDescription>Copy</BannerDescription></Banner>',
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/settings/SettingsPanel.tsx",
    slug: "components-settings-settingspanel",
    components: [
      {
        component: "banner",
        componentLabel: "Banner",
        refs: [
          "371,476,725,792,971,1152,1341,1557,1761,1847,1936,1942,2328,2347,2503,2817,2831,2980",
        ],
        docsHref: "/components/banner#source-comparison",
        migration: [
          "`Banner` replaces warning/info callouts.",
          "`tone` / alert intent -> `status`.",
          "Compose title, description, and actions with `BannerTitle`, `BannerDescription`, `BannerAction`.",
        ],
        write:
          '<Banner status="warning"><BannerTitle>Heads up</BannerTitle><BannerDescription>Copy</BannerDescription></Banner>',
      },
      {
        component: "checkbox",
        componentLabel: "Checkbox",
        refs: ["1011,1831,1920,2768"],
        docsHref: "/components/checkbox#source-comparison",
        migration: [
          "`Checkbox` replaces custom check markers and native checkbox styling.",
          "Keep `checked`, `defaultChecked`, `disabled`, and `onCheckedChange`.",
          "Labels stay outside in `Label` / `Field` composition.",
        ],
        write: "<Checkbox checked={checked} onCheckedChange={setChecked} />",
      },
      {
        component: "field",
        componentLabel: "Field",
        refs: [
          "339,344,355,446,455,465,1125,1145,1533,1545,2531,2541,2550,2559,2568,2602,2611,2620,2629,2788,2800",
        ],
        docsHref: "/components/field#source-comparison",
        migration: [
          "`FormField` / loose form rows -> `Field`.",
          "Use `FieldLabel`, `FieldControl`, `FieldDescription`, `FieldError`.",
          "Set invalid state on the control with `aria-invalid`.",
        ],
        write:
          "<Field><FieldLabel>Email</FieldLabel><FieldControl><Input /></FieldControl><FieldError>Error</FieldError></Field>",
      },
      {
        component: "input",
        componentLabel: "Input",
        refs: ["318,345,447,456,466,1127,1534,1546,2532,2542,2551,2560,2603,2612,2621,2789"],
        docsHref: "/components/input#source-comparison",
        migration: [
          "`Input` replaces local styled input shells.",
          "Keep native props: `type`, `value`, `onChange`, `disabled`, `aria-invalid`.",
          "Use `suppressPasswordManager` only for password-manager overlays.",
        ],
        write: "<Input value={value} onChange={onChange} aria-invalid={hasError} />",
      },
      {
        component: "input-group",
        componentLabel: "Input Group",
        refs: ["2335"],
        docsHref: "/components/input-group#source-comparison",
        migration: [
          "Search/slug input wrappers -> `InputGroup`.",
          "Use `InputGroupAddon` for icons or prefixes.",
          "Use `InputGroupInput` for the actual input.",
        ],
        write:
          "<InputGroup><InputGroupAddon><Search /></InputGroupAddon><InputGroupInput /></InputGroup>",
      },
      {
        component: "label",
        componentLabel: "Label",
        refs: ["307,1010,1830,1919,2767"],
        docsHref: "/components/label#source-comparison",
        migration: [
          "`Label` replaces form label text.",
          "Required marker -> `LabelAsterisk`.",
          "Optional/custom suffix -> `LabelOptional` or `LabelSub`.",
        ],
        write: "<Label>Email <LabelAsterisk /></Label>",
      },
      {
        component: "textarea",
        componentLabel: "Textarea",
        refs: ["2569,2630"],
        docsHref: "/components/textarea#source-comparison",
        migration: [
          "`Textarea` replaces local textarea shells.",
          "Use `TextareaGroup` and `TextareaCounter` only when count chrome is needed.",
          "Keep autosize/state logic in the app layer.",
        ],
        write: "<Textarea value={value} onChange={onChange} aria-invalid={hasError} />",
        noDirect: ["No old wrapper API. Compose `TextareaGroup` + `TextareaCounter`."],
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/task/CreateTaskDialog.tsx",
    slug: "components-task-createtaskdialog",
    components: [
      {
        component: "banner",
        componentLabel: "Banner",
        refs: ["69"],
        docsHref: "/components/banner#source-comparison",
        migration: [
          "`Banner` replaces warning/info callouts.",
          "`tone` / alert intent -> `status`.",
          "Compose title, description, and actions with `BannerTitle`, `BannerDescription`, `BannerAction`.",
        ],
        write:
          '<Banner status="warning"><BannerTitle>Heads up</BannerTitle><BannerDescription>Copy</BannerDescription></Banner>',
      },
      {
        component: "input",
        componentLabel: "Input",
        refs: ["77"],
        docsHref: "/components/input#source-comparison",
        migration: [
          "`Input` replaces local styled input shells.",
          "Keep native props: `type`, `value`, `onChange`, `disabled`, `aria-invalid`.",
          "Use `suppressPasswordManager` only for password-manager overlays.",
        ],
        write: "<Input value={value} onChange={onChange} aria-invalid={hasError} />",
      },
      {
        component: "text",
        componentLabel: "Text",
        refs: ["59"],
        docsHref: "/components/text#source-comparison",
        migration: [
          "Loose prose -> `Text.Sans` / `TextSans`.",
          'Use `variant="placeholder"` for slightly gray body copy.',
          "Use heading/mono variants only when semantic.",
        ],
        write: '<Text.Sans size="body" variant="placeholder">Copy</Text.Sans>',
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/task/LegacyTaskPanel.tsx",
    slug: "components-task-legacytaskpanel",
    components: [
      {
        component: "button",
        componentLabel: "Button",
        refs: ["94"],
        docsHref: "/components/button#source-comparison",
        migration: [
          "`Button` replaces legacy local button imports.",
          '`shape="icon"` -> `size="icon-sm"`.',
          '`shape="iconText"` -> normal text plus icon child with `data-icon`.',
          "`tone` -> semantic `variant`.",
          "`title` used as the label -> `aria-label`.",
        ],
        write: '<Button size="icon-sm" aria-label="Download"><Download /></Button>',
        noDirect: [
          "No public `lavender` / `lime` Button variant.",
          "If the source requires the old brutal color, pass local `className` with `bg-brutal-lavender` or `bg-brutal-lime` plus matching hover class.",
        ],
      },
      {
        component: "text",
        componentLabel: "Text",
        refs: ["112,141,154"],
        docsHref: "/components/text#source-comparison",
        migration: [
          "Loose prose -> `Text.Sans` / `TextSans`.",
          'Use `variant="placeholder"` for slightly gray body copy.',
          "Use heading/mono variants only when semantic.",
        ],
        write: '<Text.Sans size="body" variant="placeholder">Copy</Text.Sans>',
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/task/TaskItem.tsx",
    slug: "components-task-taskitem",
    components: [
      {
        component: "text",
        componentLabel: "Text",
        refs: ["59-80,125,130"],
        docsHref: "/components/text#source-comparison",
        migration: [
          "Loose prose -> `Text.Sans` / `TextSans`.",
          'Use `variant="placeholder"` for slightly gray body copy.',
          "Use heading/mono variants only when semantic.",
        ],
        write: '<Text.Sans size="body" variant="placeholder">Copy</Text.Sans>',
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/task/TasksPanel.tsx",
    slug: "components-task-taskspanel",
    components: [
      {
        component: "avatar",
        componentLabel: "Avatar",
        refs: ["409"],
        docsHref: "/components/avatar#source-comparison",
        migration: [
          "`AvatarSlot` / identity avatar -> `Avatar`, `AvatarImage`, `AvatarFallback`.",
          "Keep user lookup and initials in the app layer.",
          "Use `AvatarGroup` for stacked identities.",
        ],
        write:
          "<Avatar><AvatarImage src={src} alt={name} /><AvatarFallback>{initials}</AvatarFallback></Avatar>",
        noDirect: [
          "No identity resolver API. Resolve `src`, `name`, and `initials` before rendering.",
        ],
      },
      {
        component: "combobox",
        componentLabel: "Combobox",
        refs: ["442", "865"],
        docsHref: "/components/combobox#source-comparison",
        migration: [
          "`Combobox` replaces searchable filter dropdowns.",
          "Use `ComboboxControl`, `ComboboxInput`, `ComboboxContent`, `ComboboxItem`.",
          "Keep query/filtering and selected item data in the app layer.",
        ],
        write: "<Combobox items={items} value={value} onValueChange={setValue}>...</Combobox>",
        noDirect: ["No app-specific channel/member filtering API. Provide filtered `items`."],
      },
      {
        component: "empty-state",
        componentLabel: "Empty State",
        refs: ["959"],
        docsHref: "/components/empty-state#source-comparison",
        migration: [
          "`EmptyState` replaces blank/loading-result panels.",
          "Compose icon, title, description, and actions explicitly.",
          "Keep app-specific retry/load handlers outside.",
        ],
        write:
          "<EmptyState><EmptyStateTitle>No results</EmptyStateTitle><EmptyStateDescription>Try another filter.</EmptyStateDescription></EmptyState>",
      },
      {
        component: "text",
        componentLabel: "Text",
        refs: ["135,241,824"],
        docsHref: "/components/text#source-comparison",
        migration: [
          "Loose prose -> `Text.Sans` / `TextSans`.",
          'Use `variant="placeholder"` for slightly gray body copy.',
          "Use heading/mono variants only when semantic.",
        ],
        write: '<Text.Sans size="body" variant="placeholder">Copy</Text.Sans>',
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/thread/ThreadsInbox.tsx",
    slug: "components-thread-threadsinbox",
    components: [
      {
        component: "context-menu",
        componentLabel: "Context Menu",
        refs: ["466,481"],
        docsHref: "/components/context-menu#source-comparison",
        migration: [
          "`ContextMenu` replaces right-click menus.",
          "Wrap the target with `ContextMenuTrigger`.",
          "Use `ContextMenuItem`, `ContextMenuSeparator`, `ContextMenuShortcut`.",
        ],
        write:
          "<ContextMenu><ContextMenuTrigger render={target} /><ContextMenuContent><ContextMenuItem>Copy</ContextMenuItem></ContextMenuContent></ContextMenu>",
      },
      {
        component: "empty-state",
        componentLabel: "Empty State",
        refs: ["424"],
        docsHref: "/components/empty-state#source-comparison",
        migration: [
          "`EmptyState` replaces blank/loading-result panels.",
          "Compose icon, title, description, and actions explicitly.",
          "Keep app-specific retry/load handlers outside.",
        ],
        write:
          "<EmptyState><EmptyStateTitle>No results</EmptyStateTitle><EmptyStateDescription>Try another filter.</EmptyStateDescription></EmptyState>",
      },
      {
        component: "text",
        componentLabel: "Text",
        refs: ["162"],
        docsHref: "/components/text#source-comparison",
        migration: [
          "Loose prose -> `Text.Sans` / `TextSans`.",
          'Use `variant="placeholder"` for slightly gray body copy.',
          "Use heading/mono variants only when semantic.",
        ],
        write: '<Text.Sans size="body" variant="placeholder">Copy</Text.Sans>',
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/ui/AvatarSlot.tsx",
    slug: "components-ui-avatarslot",
    components: [
      {
        component: "avatar",
        componentLabel: "Avatar",
        refs: ["239"],
        docsHref: "/components/avatar#source-comparison",
        migration: [
          "`AvatarSlot` / identity avatar -> `Avatar`, `AvatarImage`, `AvatarFallback`.",
          "Keep user lookup and initials in the app layer.",
          "Use `AvatarGroup` for stacked identities.",
        ],
        write:
          "<Avatar><AvatarImage src={src} alt={name} /><AvatarFallback>{initials}</AvatarFallback></Avatar>",
        noDirect: [
          "No identity resolver API. Resolve `src`, `name`, and `initials` before rendering.",
        ],
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/ui/FormField.tsx",
    slug: "components-ui-formfield",
    components: [
      {
        component: "label",
        componentLabel: "Label",
        refs: ["91"],
        docsHref: "/components/label#source-comparison",
        migration: [
          "`Label` replaces form label text.",
          "Required marker -> `LabelAsterisk`.",
          "Optional/custom suffix -> `LabelOptional` or `LabelSub`.",
        ],
        write: "<Label>Email <LabelAsterisk /></Label>",
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/ui/NotificationCenter.tsx",
    slug: "components-ui-notificationcenter",
    components: [
      {
        component: "empty-state",
        componentLabel: "Empty State",
        refs: ["169"],
        docsHref: "/components/empty-state#source-comparison",
        migration: [
          "`EmptyState` replaces blank/loading-result panels.",
          "Compose icon, title, description, and actions explicitly.",
          "Keep app-specific retry/load handlers outside.",
        ],
        write:
          "<EmptyState><EmptyStateTitle>No results</EmptyStateTitle><EmptyStateDescription>Try another filter.</EmptyStateDescription></EmptyState>",
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/ui/PanelHeader.tsx",
    slug: "components-ui-panelheader",
    components: [
      {
        component: "button",
        componentLabel: "Button",
        refs: ["141"],
        docsHref: "/components/button#source-comparison",
        migration: [
          "`Button` replaces legacy local button imports.",
          '`shape="icon"` -> `size="icon-sm"`.',
          '`shape="iconText"` -> normal text plus icon child with `data-icon`.',
          "`tone` -> semantic `variant`.",
          "`title` used as the label -> `aria-label`.",
        ],
        write: '<Button size="icon-sm" aria-label="Download"><Download /></Button>',
        noDirect: [
          "No public `lavender` / `lime` Button variant.",
          "If the source requires the old brutal color, pass local `className` with `bg-brutal-lavender` or `bg-brutal-lime` plus matching hover class.",
        ],
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/ui/SearchInput.tsx",
    slug: "components-ui-searchinput",
    components: [
      {
        component: "input",
        componentLabel: "Input",
        refs: ["17"],
        docsHref: "/components/input#source-comparison",
        migration: [
          "`Input` replaces local styled input shells.",
          "Keep native props: `type`, `value`, `onChange`, `disabled`, `aria-invalid`.",
          "Use `suppressPasswordManager` only for password-manager overlays.",
        ],
        write: "<Input value={value} onChange={onChange} aria-invalid={hasError} />",
      },
      {
        component: "input-group",
        componentLabel: "Input Group",
        refs: ["15,17"],
        docsHref: "/components/input-group#source-comparison",
        migration: [
          "Search/slug input wrappers -> `InputGroup`.",
          "Use `InputGroupAddon` for icons or prefixes.",
          "Use `InputGroupInput` for the actual input.",
        ],
        write:
          "<InputGroup><InputGroupAddon><Search /></InputGroupAddon><InputGroupInput /></InputGroup>",
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/ui/SectionEyebrow.tsx",
    slug: "components-ui-sectioneyebrow",
    components: [
      {
        component: "label",
        componentLabel: "Label",
        refs: ["51"],
        docsHref: "/components/label#source-comparison",
        migration: [
          "`Label` replaces form label text.",
          "Required marker -> `LabelAsterisk`.",
          "Optional/custom suffix -> `LabelOptional` or `LabelSub`.",
        ],
        write: "<Label>Email <LabelAsterisk /></Label>",
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/ui/SelectionPopover.tsx",
    slug: "components-ui-selectionpopover",
    components: [
      {
        component: "input",
        componentLabel: "Input",
        refs: ["136"],
        docsHref: "/components/input#source-comparison",
        migration: [
          "`Input` replaces local styled input shells.",
          "Keep native props: `type`, `value`, `onChange`, `disabled`, `aria-invalid`.",
          "Use `suppressPasswordManager` only for password-manager overlays.",
        ],
        write: "<Input value={value} onChange={onChange} aria-invalid={hasError} />",
      },
      {
        component: "input-group",
        componentLabel: "Input Group",
        refs: ["136,146"],
        docsHref: "/components/input-group#source-comparison",
        migration: [
          "Search/slug input wrappers -> `InputGroup`.",
          "Use `InputGroupAddon` for icons or prefixes.",
          "Use `InputGroupInput` for the actual input.",
        ],
        write:
          "<InputGroup><InputGroupAddon><Search /></InputGroupAddon><InputGroupInput /></InputGroup>",
      },
      {
        component: "combobox",
        componentLabel: "Combobox",
        refs: ["105,157"],
        docsHref: "/components/combobox#source-comparison-selection-popover",
        migration: [
          "Searchable selection panel -> `Combobox`.",
          "Keep search, clear, and selection state controlled.",
          "Use `ComboboxItemIndicator` for selected rows.",
        ],
        write:
          "<Combobox items={options} value={value} onValueChange={setValue}><ComboboxTrigger /><ComboboxContent><ComboboxInput /><ComboboxClear /><ComboboxList>{(item) => <ComboboxItem value={item}>{item.label}<ComboboxItemIndicator /></ComboboxItem>}</ComboboxList></ComboboxContent></Combobox>",
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/ui/SlugInput.tsx",
    slug: "components-ui-sluginput",
    components: [
      {
        component: "input",
        componentLabel: "Input",
        refs: ["23"],
        docsHref: "/components/input#source-comparison",
        migration: [
          "`Input` replaces local styled input shells.",
          "Keep native props: `type`, `value`, `onChange`, `disabled`, `aria-invalid`.",
          "Use `suppressPasswordManager` only for password-manager overlays.",
        ],
        write: "<Input value={value} onChange={onChange} aria-invalid={hasError} />",
      },
      {
        component: "input-group",
        componentLabel: "Input Group",
        refs: ["15,23"],
        docsHref: "/components/input-group#source-comparison",
        migration: [
          "Search/slug input wrappers -> `InputGroup`.",
          "Use `InputGroupAddon` for icons or prefixes.",
          "Use `InputGroupInput` for the actual input.",
        ],
        write:
          "<InputGroup><InputGroupAddon><Search /></InputGroupAddon><InputGroupInput /></InputGroup>",
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/ui/Textarea.tsx",
    slug: "components-ui-textarea",
    components: [
      {
        component: "textarea",
        componentLabel: "Textarea",
        refs: ["114"],
        docsHref: "/components/textarea#source-comparison",
        migration: [
          "`Textarea` replaces local textarea shells.",
          "Use `TextareaGroup` and `TextareaCounter` only when count chrome is needed.",
          "Keep autosize/state logic in the app layer.",
        ],
        write: "<Textarea value={value} onChange={onChange} aria-invalid={hasError} />",
        noDirect: ["No old wrapper API. Compose `TextareaGroup` + `TextareaCounter`."],
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/ui/cards/ConversationPreviewCard.tsx",
    slug: "components-ui-cards-conversationpreviewcard",
    components: [
      {
        component: "avatar",
        componentLabel: "Avatar",
        refs: ["99,101"],
        docsHref: "/components/avatar#source-comparison",
        migration: [
          "`AvatarSlot` / identity avatar -> `Avatar`, `AvatarImage`, `AvatarFallback`.",
          "Keep user lookup and initials in the app layer.",
          "Use `AvatarGroup` for stacked identities.",
        ],
        write:
          "<Avatar><AvatarImage src={src} alt={name} /><AvatarFallback>{initials}</AvatarFallback></Avatar>",
        noDirect: [
          "No identity resolver API. Resolve `src`, `name`, and `initials` before rendering.",
        ],
      },
    ],
  },
  {
    sourceFile: "packages/web/src/components/ui/cards/QuotedMessageCard.tsx",
    slug: "components-ui-cards-quotedmessagecard",
    components: [
      {
        component: "avatar",
        componentLabel: "Avatar",
        refs: ["51,54"],
        docsHref: "/components/avatar#source-comparison",
        migration: [
          "`AvatarSlot` / identity avatar -> `Avatar`, `AvatarImage`, `AvatarFallback`.",
          "Keep user lookup and initials in the app layer.",
          "Use `AvatarGroup` for stacked identities.",
        ],
        write:
          "<Avatar><AvatarImage src={src} alt={name} /><AvatarFallback>{initials}</AvatarFallback></Avatar>",
        noDirect: [
          "No identity resolver API. Resolve `src`, `name`, and `initials` before rendering.",
        ],
      },
    ],
  },
  {
    sourceFile: "packages/web/src/pages/DeviceLoginPage.tsx",
    slug: "pages-deviceloginpage",
    components: [
      {
        component: "banner",
        componentLabel: "Banner",
        refs: ["85"],
        docsHref: "/components/banner#source-comparison",
        migration: [
          "`Banner` replaces warning/info callouts.",
          "`tone` / alert intent -> `status`.",
          "Compose title, description, and actions with `BannerTitle`, `BannerDescription`, `BannerAction`.",
        ],
        write:
          '<Banner status="warning"><BannerTitle>Heads up</BannerTitle><BannerDescription>Copy</BannerDescription></Banner>',
      },
      {
        component: "field",
        componentLabel: "Field",
        refs: ["89"],
        docsHref: "/components/field#source-comparison",
        migration: [
          "`FormField` / loose form rows -> `Field`.",
          "Use `FieldLabel`, `FieldControl`, `FieldDescription`, `FieldError`.",
          "Set invalid state on the control with `aria-invalid`.",
        ],
        write:
          "<Field><FieldLabel>Email</FieldLabel><FieldControl><Input /></FieldControl><FieldError>Error</FieldError></Field>",
      },
      {
        component: "input",
        componentLabel: "Input",
        refs: ["90"],
        docsHref: "/components/input#source-comparison",
        migration: [
          "`Input` replaces local styled input shells.",
          "Keep native props: `type`, `value`, `onChange`, `disabled`, `aria-invalid`.",
          "Use `suppressPasswordManager` only for password-manager overlays.",
        ],
        write: "<Input value={value} onChange={onChange} aria-invalid={hasError} />",
      },
    ],
  },
  {
    sourceFile: "packages/web/src/pages/HumanLoginSetupPage.tsx",
    slug: "pages-humanloginsetuppage",
    components: [
      {
        component: "label",
        componentLabel: "Label",
        refs: ["107"],
        docsHref: "/components/label#source-comparison",
        migration: [
          "`Label` replaces form label text.",
          "Required marker -> `LabelAsterisk`.",
          "Optional/custom suffix -> `LabelOptional` or `LabelSub`.",
        ],
        write: "<Label>Email <LabelAsterisk /></Label>",
      },
    ],
  },
  {
    sourceFile: "packages/web/src/pages/PaletteAuditPage.tsx",
    slug: "pages-paletteauditpage",
    components: [
      {
        component: "avatar",
        componentLabel: "Avatar",
        refs: ["297,303,394,415,421"],
        docsHref: "/components/avatar#source-comparison",
        migration: [
          "`AvatarSlot` / identity avatar -> `Avatar`, `AvatarImage`, `AvatarFallback`.",
          "Keep user lookup and initials in the app layer.",
          "Use `AvatarGroup` for stacked identities.",
        ],
        write:
          "<Avatar><AvatarImage src={src} alt={name} /><AvatarFallback>{initials}</AvatarFallback></Avatar>",
        noDirect: [
          "No identity resolver API. Resolve `src`, `name`, and `initials` before rendering.",
        ],
      },
    ],
  },
] as const satisfies readonly MigrationGuide[];

export function getMigrationGuide(slug: string): MigrationGuide | undefined {
  return MIGRATION_GUIDES.find((guide) => guide.slug === slug);
}
