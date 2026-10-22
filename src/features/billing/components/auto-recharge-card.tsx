"use client";

import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { billingArt } from "@/config/assets";
import { isApiError } from "@/lib/api";
import { formatUsd } from "@/lib/format";
import { toast } from "@/stores/toast-store";
import { type AutoRechargeSettings, type PaymentMethod } from "@/types/domain";

import { useUpdateAutoRecharge } from "../hooks/use-billing";
import { cardLabel } from "../lib/cards";

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-1">
      <dt className="text-caption leading-[1.2] font-bold text-subtle uppercase">{label}:</dt>
      <dd className="text-body leading-[1.2] font-medium text-emphasis">{value}</dd>
    </div>
  );
}

interface AutoRechargeCardProps {
  settings: AutoRechargeSettings | undefined;
  cards: PaymentMethod[];
  /** Switch turned on: opens Enable Auto Recharge (the switch flips once that saves). */
  onEnable: () => void;
  onManage: () => void;
}

/** Auto Recharge card (Figma: auto-recharge-card, off `1387:67354`, on `1795:103990`). */
export function AutoRechargeCard({ settings, cards, onEnable, onManage }: AutoRechargeCardProps) {
  const update = useUpdateAutoRecharge();
  const enabled = settings?.enabled ?? false;
  const card = cards.find((item) => item.id === settings?.paymentMethodId);

  const turnOff = () =>
    update.mutate(
      { enabled: false },
      {
        onSuccess: () => toast.success("Auto Recharge turned off"),
        onError: (error) =>
          toast.danger(isApiError(error) ? error.message : "Could not turn off Auto Recharge."),
      },
    );

  return (
    <section
      aria-labelledby="auto-recharge-title"
      className="flex flex-col gap-5 rounded-lg border border-default bg-canvas p-6"
    >
      <div className="flex items-start gap-4.5">
        <Image
          src={billingArt.autoRecharge.src}
          alt=""
          width={billingArt.autoRecharge.width}
          height={billingArt.autoRecharge.height}
          unoptimized
          className="shrink-0"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h2
            id="auto-recharge-title"
            className="text-heading-sm leading-[1.2] font-bold text-secondary"
          >
            Auto Recharge
          </h2>
          <p id="auto-recharge-description" className="text-body leading-[1.4] text-subtle">
            Automatically add credits when your balance runs low.
          </p>
        </div>
        <Switch
          tone="success"
          checked={enabled}
          disabled={!settings || update.isPending}
          onCheckedChange={(next) => (next ? onEnable() : turnOff())}
          aria-labelledby="auto-recharge-title"
          aria-describedby="auto-recharge-description"
        />
      </div>

      {enabled && settings && (
        <>
          <hr className="border-t border-divider-soft" />
          <div className="flex flex-wrap items-end justify-between gap-5">
            <dl className="flex flex-col gap-2.5">
              <SettingRow
                label="Recharge when balance falls below"
                value={formatUsd(settings.threshold ?? 0)}
              />
              <SettingRow label="Automatically Add" value={formatUsd(settings.amount ?? 0)} />
              <SettingRow label="Payment Method" value={card ? cardLabel(card) : "—"} />
            </dl>
            <Button variant="secondary" radius="md" onClick={onManage}>
              Manage Card
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
