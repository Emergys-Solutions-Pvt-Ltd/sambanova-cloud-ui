import { GithubIcon, GoogleIcon, MicrosoftIcon } from "@/components/brand/social-icons";
import { Tooltip } from "@/components/ui/tooltip";

const providers = [
  { name: "Google", Icon: GoogleIcon },
  { name: "Microsoft", Icon: MicrosoftIcon },
  { name: "GitHub", Icon: GithubIcon },
] as const;

/**
 * Provider buttons from the Figma design. Social sign-in is not wired up yet, so they
 * are announced as unavailable and do nothing.
 */
export function SocialButtons() {
  return (
    <ul className="grid grid-cols-3 gap-3">
      {providers.map(({ name, Icon }) => (
        <li key={name}>
          <Tooltip content="Coming soon" side="top">
            <button
              type="button"
              aria-disabled="true"
              aria-label={`Continue with ${name} (coming soon)`}
              onClick={(event) => event.preventDefault()}
              className="flex h-12.5 w-full items-center justify-center rounded-md border border-social bg-input"
            >
              <Icon className="size-5.5" />
            </button>
          </Tooltip>
        </li>
      ))}
    </ul>
  );
}
