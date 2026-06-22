"use client"
import { useEffect, useMemo, useRef, useState } from "react";

type ShopItem = {
  id: string;
  name: string;
  baseCost: number;
  cps: number;
  description: string;
};

const SHOP_ITEMS: ShopItem[] = [
  { id: "cursor", name: "Cursor", baseCost: 15, cps: 0.1, description: "Auto-clicks for you." },
  { id: "robot", name: "Robot", baseCost: 100, cps: 1, description: "Generates points with precision." },
  { id: "farm", name: "Farm", baseCost: 500, cps: 4, description: "Harvests points from fields." },
  { id: "mine", name: "Mine", baseCost: 2000, cps: 10, description: "Digs up points ore." },
  { id: "factory", name: "Factory", baseCost: 10000, cps: 40, description: "Mass-produces points." },
];

function TabPanel({ value, tabid, className, children }: { value: number; tabid: number; className?: string; children: React.ReactNode }) {
  return value === tabid ? <div role="tabpanel" className={className || "w-full h-full"}>{children}</div> : null;
}

function TabButton({ tabid, currentTab, setCurrentTab, children }: { tabid: number; currentTab: number; setCurrentTab: (tabid: number) => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-controls={`tab-${String.fromCharCode(65 + tabid)}`}
      aria-selected={currentTab === tabid}
      className="rounded border border-black/20 bg-slate-100 px-3 py-2 text-sm font-medium transition hover:bg-slate-200"
      onClick={() => setCurrentTab(tabid)}
    >
      {children}
    </button>
  );
}

export default function ClickerGame() {
  const [activeTab, setActiveTab] = useState(0);
  const [points, setPoints] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [purchased, setPurchased] = useState<Record<string, number>>({});
  const [lastPurchased, setLastPurchased] = useState<string | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handlePointClick = () => {
    setPoints((current) => current + 1);
    setTotalPoints((total) => total + 1);
  };

  const ownedItems = useMemo(
    () => SHOP_ITEMS.map((item) => ({ ...item, count: purchased[item.id] ?? 0 })),
    [purchased],
  );

  const pointsPerSecond = useMemo(
    () => ownedItems.reduce((sum, item) => sum + item.count * item.cps, 0),
    [ownedItems],
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setPoints((current) => {
        const next = current + pointsPerSecond;
        setTotalPoints((total) => total + pointsPerSecond);
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [pointsPerSecond]);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      if (buttonRef.current && buttonRef.current.contains(e.target as Node)) {
        e.preventDefault();
        setPoints((current) => current + 1);
        setTotalPoints((total) => total + 1);
      }
    };

    window.addEventListener("contextmenu", handleContextMenu);
    return () => window.removeEventListener("contextmenu", handleContextMenu);
  }, []);

  const purchaseCost = (item: ShopItem) => {
    const count = purchased[item.id] ?? 0;
    return Math.floor(item.baseCost * Math.pow(1.15, count));
  };

  const canAfford = (cost: number) => points >= cost;

  const buyItem = (item: ShopItem) => {
    const cost = purchaseCost(item);
    if (!canAfford(cost)) return;
    setPoints((current) => current - cost);
    setPurchased((prev) => ({ ...prev, [item.id]: (prev[item.id] ?? 0) + 1 }));
    setLastPurchased(item.name);
  };

  const progressLevel = useMemo(() => Math.min(10, Math.floor(totalPoints / 5000)), [totalPoints]);

  return (
    <div className="mx-auto my-8 window active max-w-6xl min-h-[80vh] shadow-xl select-none">
      <div className="title-bar">
        <div className="title-bar-text">Point Clicker 7.css</div>
        <div className="title-bar-controls">
          <button aria-label="Minimize"></button>
          <button aria-label="Maximize"></button>
          <button aria-label="Close"></button>
        </div>
      </div>

      <div className="window-body has-space p-4 flex flex-col gap-4">
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="rounded border border-black/20 bg-white/90 p-4 shadow-sm">
            <div className="mb-4 border-b border-black/10 pb-2">
              <div className="text-base font-semibold">Generator</div>
            </div>
            <div className="flex flex-col items-center justify-center gap-4">
              <button
                ref={buttonRef}
                type="button"
                className="text-6xl rounded-full aspect-square px-8 py-8 border border-black"
                onClick={handlePointClick}
                aria-label="Generate points"
                style={{ userSelect: "none", fontSize: "6rem !important" }}
              >
                ⭐
              </button>
              <div className="text-center space-y-2">
                <p className="text-xl font-semibold">Generate Points</p>
                <p>{pointsPerSecond.toFixed(1)} points per second</p>
                <p>{Math.round(points)} points ready to spend</p>
              </div>
            </div>
          </div>

          <div className="rounded border border-black/20 bg-white/90 p-4 shadow-sm">
            <div className="mb-4 border-b border-black/10 pb-2">
              <div className="text-base font-semibold">Stats</div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <span>Total points</span>
                <strong>{Math.floor(totalPoints)}</strong>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span>Current points</span>
                <strong>{Math.floor(points)}</strong>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span>Points per second</span>
                <strong>{pointsPerSecond.toFixed(1)}</strong>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span>Progress level</span>
                <strong>{progressLevel}</strong>
              </div>
              <div className="border-t border-black/20 pt-3">
                <p className="font-semibold">Latest purchase</p>
                <p>{lastPurchased ?? "No purchases yet"}</p>
              </div>
            </div>
          </div>
        </div>

        <section className="rounded border border-black/20 bg-white/90 p-4 shadow-sm">
          <div className="mb-4 border-b border-black/10 pb-2">
            <div className="text-base font-semibold">Game Menu</div>
          </div>

          <menu role="tablist" aria-label="Game menu tabs">
            <TabButton tabid={0} currentTab={activeTab} setCurrentTab={setActiveTab}>
              Active
            </TabButton>
            <TabButton tabid={1} currentTab={activeTab} setCurrentTab={setActiveTab}>
              Shop
            </TabButton>
            <TabButton tabid={2} currentTab={activeTab} setCurrentTab={setActiveTab}>
              Upgrades
            </TabButton>
          </menu>

          <TabPanel value={activeTab} tabid={0} className="space-y-4">
            <div className="rounded border border-black/20 bg-white/80 p-4 shadow-sm">
              <div className="mb-4 border-b border-black/10 pb-2">
                <div className="text-base font-semibold">Active Generators</div>
              </div>
              <div>
                <p className="mb-3">Click the star to generate points, or expand your operation with passive income from shop items.</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {ownedItems.map((item) => (
                    <div key={item.id} className="rounded border border-black/20 p-3 bg-white/80">
                      <div className="flex items-center justify-between gap-2">
                        <strong>{item.name}</strong>
                        <span>{item.count} owned</span>
                      </div>
                      <div className="text-xs text-slate-600">{item.cps.toFixed(1)} cps each</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabPanel>

          <TabPanel value={activeTab} tabid={1} className="space-y-4">
            <div className="rounded border border-black/20 bg-white/80 p-4 shadow-sm">
              <div className="mb-4 border-b border-black/10 pb-2">
                <div className="text-base font-semibold">Shop</div>
              </div>
              <div className="space-y-3">
                {SHOP_ITEMS.map((item) => {
                  const cost = purchaseCost(item);
                  return (
                    <div key={item.id} className="rounded border border-black/20 p-3 bg-white/80 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <strong>{item.name}</strong>
                        <p className="text-xs text-slate-600">{item.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{cost} points</span>
                        <button
                          type="button"
                          className="px-3 py-2 rounded disabled:opacity-40"
                          onClick={() => buyItem(item)}
                          disabled={!canAfford(cost)}
                        >
                          Buy
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabPanel>

          <TabPanel value={activeTab} tabid={2} className="space-y-4">
            <div className="rounded border border-black/20 bg-white/80 p-4 shadow-sm">
              <div className="mb-4 border-b border-black/10 pb-2">
                <div className="text-base font-semibold">Upgrades</div>
              </div>
              <div className="space-y-3 text-sm">
                <p>Build a balanced operation: buy many cursors first, then upgrade into robots, farms, mines, and factories for production.</p>
                <ul className="list-disc list-inside">
                  <li>Cursor: low cost, steady early income.</li>
                  <li>Robot: strong passive yields.</li>
                  <li>Farm: larger income spikes midgame.</li>
                  <li>Mine: heavy output for scaling.</li>
                  <li>Factory: unlocks late-game power.</li>
                </ul>
                <p className="mt-2">Tip: your next item cost grows with each purchase, so spend wisely and enjoy the clicker flow.</p>
              </div>
            </div>
          </TabPanel>
        </section>
      </div>
    </div>
  );
}
