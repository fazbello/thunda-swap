// ... imports and state setup remain unchanged

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
  wallet: { address: string; nativeBalance: string };
}) {
  // ... state hooks

  // REMOVED: checkNetwork and all network switching logic

  // REMOVED: any UI that blocks for "Wrong Network" or asks for Orbiter Dex Chain

  // Render your app normally
  return (
    <>
      {/* ...your layout and navigation */}
      {children}
    </>
  );
}
