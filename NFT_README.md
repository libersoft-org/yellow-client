# NFT Support in Yellow Wallet

Peněženka Yellow nyní podporuje zobrazení a správu NFT (Non-Fungible Tokens).

## Struktura NFT

Každé NFT má následující strukturu:

```typescript
interface INFTData {
	contract_address: string; // Adresa smart contractu NFT
	token_id: string; // Jedinečné ID tokenu v rámci contractu
	name?: string; // Název NFT
	description?: string; // Popis NFT
	image?: string; // URL k obrázku NFT
	animation_url?: string; // URL k animaci/videu (pokud NFT obsahuje animaci)
	external_url?: string; // Externí URL s více informacemi
	attributes?: Array<{
		// Vlastnosti/atributy NFT
		trait_type: string;
		value: string | number;
	}>;
}
```

## Přidání NFT do peněženky

### Ruční přidání přes kód:

```typescript
import { addNFT } from 'libersoft-crypto/network.ts';

// Příklad přidání NFT
const nftData = {
	contract_address: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
	token_id: '1234',
	name: 'Bored Ape #1234',
	description: 'A unique Bored Ape Yacht Club NFT',
	image: 'https://ipfs.io/ipfs/QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/1234',
	external_url: 'https://boredapeyachtclub.com/#/gallery/1234',
	attributes: [
		{ trait_type: 'Background', value: 'Blue' },
		{ trait_type: 'Fur', value: 'Brown' },
	],
};

addNFT(networkGuid, nftData);
```

### Použití ukázkových dat:

V souboru `static/modules/org.libersoft.wallet/json/sample-nfts.json` najdeš 5 příkladů NFT:

1. **CryptoPunk #1234** - Classic punk s Pilot Helmet
2. **Bored Ape #5678** - BAYC s Golden Brown fur a Spinner Hat
3. **Azuki #9876** - Anime-style s Pink Disheveled hair
4. **Pudgy Penguin #2468** - Cute penguin s Bucket Hat
5. **Art Blocks Curated #135792** - Generative art Chromie Squiggle

## Zobrazení v Balance

NFT se zobrazují v sekci "NFTs:" na stránce Balance s následujícími funkcemi:

- **Ikona**: Zobrazuje obrázek NFT nebo placeholder
- **Název**: Název NFT nebo "NFT #[token_id]" jako fallback
- **Popis**: Popis NFT (pokud existuje)
- **Contract info**: V debug módu se zobrazí adresa contractu a token ID
- **Vlastnictví**: Zobrazuje "Owned" místo balance
- **Akce**: Tlačítko "View Details" pro externí link

## API funkce

- `addNFT(networkGuid, nftData)` - Přidá NFT do sítě
- `editNFT(networkGuid, nftGuid, nftData)` - Upraví existující NFT
- `deleteNFT(networkGuid, nftGuid)` - Smaže NFT ze sítě

## Známé kolekce a jejich contract adresy

### Ethereum Mainnet:

- **CryptoPunks**: `0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB`
- **Bored Ape Yacht Club**: `0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D`
- **Azuki**: `0xED5AF388653567Af2F388E6224dC7C4b3241C544`
- **Pudgy Penguins**: `0xBd3531dA5CF5857e7CfAA92426877b022e612cf8`
- **Art Blocks Curated**: `0xa7d8d9ef8D8Ce8992Df33D8b8CF4Aebabd5bD270`

## Budoucí vylepšení

- Automatické načítání NFT z blockchain
- Podpora pro ERC-721 a ERC-1155 standardy
- Batch loading NFT metadat
- NFT marketplace integrace
- Podporu pro více síti (Polygon, BSC, etc.)
