"use client";

import { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type CompareSlot } from "@/types/domain";

import { CompareColumn } from "./compare-column";
import { Composer } from "./composer";

const SLOTS: CompareSlot[] = ["a", "b"];

/**
 * Compare mode of the Chat area (Figma: Compare `1398:119699`, Compare Results `1398:120029`,
 * light `1520:48017`): two independently scrolling columns split by a hairline that stops at the
 * composer top, and the shared dock composer. Below a 672px Chat area the columns become
 * "Model A / Model B" tabs (decision C14).
 */
export function CompareView() {
  const [activeSlot, setActiveSlot] = useState<CompareSlot>("a");

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <span
        aria-hidden
        className="absolute top-0 bottom-37.5 left-1/2 hidden border-l border-hairline @2xl:block"
      />
      <Tabs
        value={activeSlot}
        onValueChange={(value) => setActiveSlot(value === "b" ? "b" : "a")}
        className="flex min-h-0 flex-1 flex-col"
      >
        <TabsList aria-label="Compared models" className="mx-4 mt-4 self-start @2xl:hidden">
          <TabsTrigger value="a">Model A</TabsTrigger>
          <TabsTrigger value="b">Model B</TabsTrigger>
        </TabsList>
        <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)] gap-x-10 px-4 pt-4 @2xl:grid-cols-2 @2xl:px-5 @2xl:pt-5">
          {SLOTS.map((slot) => (
            <TabsContent
              key={slot}
              value={slot}
              forceMount
              className="flex min-h-0 flex-col data-[state=inactive]:@max-2xl:hidden"
            >
              <CompareColumn slot={slot} />
            </TabsContent>
          ))}
        </div>
      </Tabs>
      <div className="mx-auto w-full max-w-215 shrink-0 px-4 pt-6.5 pb-5 @min-[57.5rem]:px-0">
        <Composer placement="dock" />
      </div>
    </div>
  );
}
