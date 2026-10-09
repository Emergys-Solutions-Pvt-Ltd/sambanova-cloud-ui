import { ArrowLink } from "@/components/ui/arrow-link";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon/icon";
import { externalLinks } from "@/config/links";

/** "Earn Free Credits" promo card. */
export function FreeCreditsCard() {
  return (
    <Card
      as="section"
      aria-labelledby="free-credits-title"
      padding="lg"
      className="flex flex-col justify-between gap-8 bg-promo"
    >
      <div className="flex flex-col gap-6">
        <span
          aria-hidden="true"
          className="flex size-11.5 items-center justify-center rounded-full bg-chip text-primary"
        >
          <Icon name="rocket" size="md" />
        </span>
        <div className="flex flex-col gap-2.5">
          <h2 id="free-credits-title" className="text-heading-md text-secondary">
            Earn Free Credits
          </h2>
          <p className="text-body font-medium text-muted">
            Contribute to the community and unlock free credits to power your AI journey.
          </p>
        </div>
      </div>
      <ArrowLink href={externalLinks.community} target="_blank" rel="noopener noreferrer">
        Visit Community
      </ArrowLink>
    </Card>
  );
}
