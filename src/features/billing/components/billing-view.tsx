"use client";

import { useState } from "react";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { isApiError } from "@/lib/api";
import { toast } from "@/stores/toast-store";
import { type PaymentMethod } from "@/types/domain";

import {
  useAutoRecharge,
  useInvoices,
  usePaymentMethods,
  useRemovePaymentMethod,
  useUpdateAutoRecharge,
} from "../hooks/use-billing";
import { autopayCardId, cardLabel, orderCards } from "../lib/cards";
import { AddPaymentMethodDialog } from "./add-payment-method-dialog";
import { AutoRechargeCard } from "./auto-recharge-card";
import { type AutoRechargeDialogMode, AutoRechargeDialog } from "./auto-recharge-dialog";
import { BillingZeroState } from "./billing-zero-state";
import { CreditsCard } from "./credits-card";
import { INVOICES_PAGE_SIZE, InvoicesTable } from "./invoices-table";
import { type CardAction, MyCardsPanel } from "./my-cards-panel";

type Confirmation = { kind: "switch" | "remove"; card: PaymentMethod };

const strong = "font-semibold text-primary";

/**
 * Project Settings › Billing (Figma `1387:67354`). Billing belongs to the signed-in account, so
 * every project shows the same credits, cards and invoices.
 */
export function BillingView() {
  const cardsQuery = usePaymentMethods();
  const autoRecharge = useAutoRecharge();
  // Same key as the table's first page, so the table reuses this request.
  const firstInvoices = useInvoices({ page: 1, pageSize: INVOICES_PAGE_SIZE });
  const updateAutoRecharge = useUpdateAutoRecharge();
  const removeCard = useRemovePaymentMethod();

  const [rechargeDialog, setRechargeDialog] = useState<{
    open: boolean;
    mode: AutoRechargeDialogMode;
    cardId?: string;
  }>({ open: false, mode: "enable" });
  const [addCard, setAddCard] = useState({ open: false, session: 0 });
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const settings = autoRecharge.data;
  const autopayId = autopayCardId(settings);
  const cards = cardsQuery.data ? orderCards(cardsQuery.data, autopayId) : undefined;
  const autopayCard = cards?.find((card) => card.id === autopayId);

  const loading = cardsQuery.isPending || firstInvoices.isPending;
  const isNewAccount = cards?.length === 0 && firstInvoices.data?.total === 0;

  const openRechargeDialog = (mode: AutoRechargeDialogMode, cardId?: string) =>
    setRechargeDialog({ open: true, mode, cardId });
  const openAddCard = () => setAddCard((state) => ({ open: true, session: state.session + 1 }));
  const confirm = (kind: Confirmation["kind"], card: PaymentMethod) => {
    setConfirmation({ kind, card });
    setConfirmOpen(true);
  };

  const onCardAction = (card: PaymentMethod, action: CardAction) => {
    if (action === "turn-off") {
      updateAutoRecharge.mutate(
        { enabled: false },
        {
          onSuccess: () => toast.success("Auto Recharge turned off"),
          onError: (error) =>
            toast.danger(isApiError(error) ? error.message : "Could not turn off Auto Recharge."),
        },
      );
    } else if (action === "use") {
      openRechargeDialog("enable", card.id);
    } else {
      confirm(action, card);
    }
  };

  const runConfirmation = async () => {
    if (!confirmation) return;
    const { kind, card } = confirmation;
    if (kind === "switch") {
      await updateAutoRecharge.mutateAsync({
        enabled: true,
        paymentMethodId: card.id,
        threshold: settings?.threshold ?? undefined,
        amount: settings?.amount ?? undefined,
      });
      toast.success(`Auto Recharge now uses ${cardLabel(card)}`);
    } else {
      await removeCard.mutateAsync(card.id);
      toast.success(`${cardLabel(card)} removed`);
    }
    setConfirmOpen(false);
  };

  if (loading) {
    return (
      <div
        aria-busy="true"
        aria-label="Loading billing"
        className="flex flex-col gap-6 xl:flex-row"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <Skeleton className="h-35.25 rounded-lg" />
          <Skeleton className="h-23.5 rounded-lg" />
          <Skeleton className="h-80 rounded-lg" />
        </div>
        <Skeleton className="h-156.75 rounded-lg xl:w-90.75" />
      </div>
    );
  }

  return (
    <>
      {isNewAccount ? (
        <BillingZeroState />
      ) : (
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <CreditsCard />
            <AutoRechargeCard
              settings={settings}
              cards={cards ?? []}
              onEnable={() => openRechargeDialog("enable")}
              onManage={() => openRechargeDialog("manage")}
            />
            <InvoicesTable />
          </div>
          <MyCardsPanel
            cards={cards}
            onRetry={cardsQuery.isError ? () => void cardsQuery.refetch() : undefined}
            autopayId={autopayId}
            autoRechargeOn={settings?.enabled ?? false}
            onAddCard={openAddCard}
            onAction={onCardAction}
            className="shrink-0 xl:w-90.75"
          />
        </div>
      )}

      <AutoRechargeDialog
        open={rechargeDialog.open}
        onOpenChange={(open) => setRechargeDialog((state) => ({ ...state, open }))}
        mode={rechargeDialog.mode}
        cardId={rechargeDialog.cardId}
        cards={cards ?? []}
        settings={settings}
      />

      <AddPaymentMethodDialog
        key={addCard.session}
        open={addCard.open}
        onOpenChange={(open) => setAddCard((state) => ({ ...state, open }))}
      />

      {confirmation && (
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          {...(confirmation.kind === "switch"
            ? {
                title: "Switch Auto Recharge Card",
                icon: "repeat" as const,
                tone: "warning" as const,
                confirmLabel: "Switch Card",
                description: (
                  <>
                    Auto-recharge is currently enabled on the card ending in{" "}
                    <strong className={strong}>{autopayCard?.last4}</strong>. Switching will use the
                    card ending in <strong className={strong}>{confirmation.card.last4}</strong> for
                    future automatic credit purchases.
                  </>
                ),
              }
            : {
                title: "Remove Card?",
                icon: "alert-triangle" as const,
                tone: "danger" as const,
                confirmLabel: "Remove Card",
                description:
                  `Are you sure you want to remove ${cardLabel(confirmation.card)} from your account?` +
                  (confirmation.card.id === autopayId ? " Auto Recharge will be turned off." : ""),
              })}
          onConfirm={runConfirmation}
        />
      )}
    </>
  );
}
