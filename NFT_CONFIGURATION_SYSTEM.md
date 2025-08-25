README: NFT Configuration System

## Implementované funkce:

### 1. **SettingsNetworksNFTs.svelte** - Správa NFT kontraktů

- Zobrazení seznamu nakonfigurovaných NFT kontraktů
- Drag & drop reordering
- Přidání/editace/mazání NFT kontraktů
- Načítání informací o kontraktech

### 2. **SettingsNetworksNFTsAddEdit.svelte** - Formulář pro NFT

- Přidání nového NFT kontraktu
- Editace existujícího NFT kontraktu
- Povinná pole: Contract address
- Volitelná pole: Token ID, Name, Description, Image URL, External URL

### 3. **DialogNFTDel.svelte** - Dialog pro mazání NFT

- Potvrzení mazání NFT kontraktu
- Zobrazení informací o mazaném NFT

### 4. **Integrace do nastavení**

- Přidáno tlačítko NFT ikony v Settings > Networks
- Nové menu sekce pro každou síť: networks-nfts-{networkGuid}
- Automatické načítání do settings struktury

### 5. **Rozšíření balance.ts**

- Funkce `getNFTsForAddress()` nyní používá nakonfigurované NFT kontrakty
- Fallback na výchozí kontrakty pokud žádné nejsou nakonfigurované
- Import `nftStore` pro čtení nakonfigurovaných NFT

### 6. **Rozšíření network.ts**

- Přidána funkce `reorderNFTs()` pro drag & drop
- Existující funkce: `addNFT()`, `editNFT()`, `deleteNFT()`
- Store `nfts` pro reactive čtení NFT kontraktů

## Jak použít:

1. **Přidat NFT kontrakt:**

   - Settings > Networks > klikni na NFT ikonu u sítě
   - "Add NFT Contract"
   - Zadej contract address (povinné)
   - Volitelně: Token ID (pro specifický NFT), Name, Description, Image URL, External URL

2. **Spravovat NFT kontrakty:**

   - Drag & drop pro změnu pořadí
   - Edit ikona pro úpravu
   - Delete ikona pro smazání (s potvrzením)

3. **Zobrazení NFT:**
   - NFT kontrakty se automaticky načítají v Balance komponentě
   - Používá se seznam z nastavení místo hardcoded kontraktů

## Příklad použití:

Pro váš Baby Eggs NFT na Polygon:

- Contract address: `0x366B4C4F5f602eF5E18e3F3a15052db8841de01E`
- Token ID: `96931881880619166233561556717900660211897371081598974059752591339469234241537` (nebo prázdné pro celý kontrakt)
- Name: "Baby Eggs"
- External URL: link na Rarible marketplace
