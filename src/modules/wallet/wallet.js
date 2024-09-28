let address = '0x123abc...456def';
let balance = {
 crypto: '8.33 MATIC',
 fiat: '5.20 USD'
};
let wallets = [
 {
  id: 1,
  name: 'My Yellow Wallet 1'
 },
 {
  id: 2,
  name: 'My Yellow Wallet 2'
 }
];
let networks = [
 {
  id: 1,
  name: 'Ethereum - Mainnet',
  chainID: 1,
  rpcURLs: ['https://mainnet.infura.io/v3/YOUR-PROJECT-ID', 'https://eth-mainnet.alchemyapi.io/v2/YOUR-API-KEY', 'https://cloudflare-eth.com', 'https://rpc.ankr.com/eth', 'https://main-rpc.linkpool.io', 'https://eth-rpc.gateway.pokt.network', 'https://mainnet-nethermind.blockscout.com', 'https://api.mycryptoapi.com/eth'],
  currency: {
   symbol: 'ETH',
   iconURL: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
  },
  explorerURL: 'https://etherscan.io'
 },
 {
  id: 2,
  name: 'Ethereum - Goerli Testnet',
  chainID: 5,
  rpcURLs: ['https://goerli.infura.io/v3/YOUR-PROJECT-ID', 'https://eth-goerli.g.alchemy.com/v2/YOUR-API-KEY', 'https://rpc.goerli.mudit.blog/', 'https://rpc.ankr.com/eth_goerli', 'https://goerli.blockpi.network/v1/rpc/public'],
  currency: {
   symbol: 'ETH',
   iconURL: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
  },
  explorerURL: 'https://goerli.etherscan.io'
 },
 {
  id: 3,
  name: 'Ethereum - Sepolia Testnet',
  chainID: 11155111,
  rpcURLs: ['https://sepolia.infura.io/v3/YOUR-PROJECT-ID', 'https://rpc.sepolia.org', 'https://sepolia.blockpi.network/v1/rpc/public'],
  currency: {
   symbol: 'ETH',
   iconURL: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
  },
  explorerURL: 'https://sepolia.etherscan.io'
 },
 {
  id: 4,
  name: 'Ethereum - Ropsten Testnet (Deprecated)',
  chainID: 3,
  rpcURLs: ['https://ropsten.infura.io/v3/YOUR-PROJECT-ID', 'https://eth-ropsten.alchemyapi.io/v2/YOUR-API-KEY'],
  currency: {
   symbol: 'ETH',
   iconURL: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
  },
  explorerURL: 'https://ropsten.etherscan.io'
 },
 {
  id: 5,
  name: 'Ethereum - Rinkeby Testnet (Deprecated)',
  chainID: 4,
  rpcURLs: ['https://rinkeby.infura.io/v3/YOUR-PROJECT-ID', 'https://eth-rinkeby.alchemyapi.io/v2/YOUR-API-KEY', 'https://rinkeby-light.eth.linkpool.io/'],
  currency: {
   symbol: 'ETH',
   iconURL: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
  },
  explorerURL: 'https://rinkeby.etherscan.io'
 },
 {
  id: 6,
  name: 'Binance Smart Chain - Mainnet',
  chainID: 56,
  rpcURLs: ['https://bsc-dataseed.binance.org/', 'https://bsc-dataseed1.defibit.io/', 'https://bsc-dataseed1.ninicoin.io/', 'https://rpc.ankr.com/bsc', 'https://bscrpc.com'],
  currency: {
   symbol: 'BNB',
   iconURL: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.png'
  },
  explorerURL: 'https://bscscan.com'
 },
 {
  id: 7,
  name: 'Binance Smart Chain - Testnet',
  chainID: 97,
  rpcURLs: ['https://data-seed-prebsc-1-s1.binance.org:8545/', 'https://data-seed-prebsc-2-s2.binance.org:8545/', 'https://data-seed-prebsc-1-s3.binance.org:8545/', 'https://rpc.ankr.com/bsc_testnet_chapel'],
  currency: {
   symbol: 'tBNB',
   iconURL: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.png'
  },
  explorerURL: 'https://testnet.bscscan.com'
 },
 {
  id: 8,
  name: 'Polygon - Mainnet',
  chainID: 137,
  rpcURLs: ['https://polygon-rpc.com', 'https://rpc-mainnet.maticvigil.com/', 'https://rpc-mainnet.matic.network', 'https://rpc-mainnet.matic.quiknode.pro', 'https://matic-mainnet.chainstacklabs.com'],
  currency: {
   symbol: 'MATIC',
   iconURL: 'https://cryptologos.cc/logos/polygon-matic-logo.png'
  },
  explorerURL: 'https://polygonscan.com'
 },
 {
  id: 9,
  name: 'Polygon - Mumbai Testnet',
  chainID: 80001,
  rpcURLs: ['https://rpc-mumbai.maticvigil.com/', 'https://rpc-mumbai.matic.today', 'https://matic-testnet-archive-rpc.bwarelabs.com', 'https://rpc.ankr.com/polygon_mumbai'],
  currency: {
   symbol: 'MATIC',
   iconURL: 'https://cryptologos.cc/logos/polygon-matic-logo.png'
  },
  explorerURL: 'https://mumbai.polygonscan.com'
 },
 {
  id: 10,
  name: 'Avalanche - C-Chain Mainnet',
  chainID: 43114,
  rpcURLs: ['https://api.avax.network/ext/bc/C/rpc', 'https://rpc.ankr.com/avalanche', 'https://ava-mainnet.public.blastapi.io/ext/bc/C/rpc', 'https://avalanche-c-chain.publicnode.com'],
  currency: {
   symbol: 'AVAX',
   iconURL: 'https://cryptologos.cc/logos/avalanche-avax-logo.png'
  },
  explorerURL: 'https://snowtrace.io'
 },
 {
  id: 11,
  name: 'Avalanche - Fuji Testnet',
  chainID: 43113,
  rpcURLs: ['https://api.avax-test.network/ext/bc/C/rpc', 'https://rpc.ankr.com/avalanche_fuji', 'https://ava-testnet.public.blastapi.io/ext/bc/C/rpc'],
  currency: {
   symbol: 'AVAX',
   iconURL: 'https://cryptologos.cc/logos/avalanche-avax-logo.png'
  },
  explorerURL: 'https://testnet.snowtrace.io'
 },
 {
  id: 12,
  name: 'Fantom Opera - Mainnet',
  chainID: 250,
  rpcURLs: ['https://rpc.ftm.tools/', 'https://fantom-mainnet.public.blastapi.io', 'https://rpc.ankr.com/fantom', 'https://rpcapi.fantom.network'],
  currency: {
   symbol: 'FTM',
   iconURL: 'https://cryptologos.cc/logos/fantom-ftm-logo.png'
  },
  explorerURL: 'https://ftmscan.com'
 },
 {
  id: 13,
  name: 'Fantom Opera - Testnet',
  chainID: 4002,
  rpcURLs: ['https://rpc.testnet.fantom.network/', 'https://fantom-testnet.public.blastapi.io', 'https://rpc.ankr.com/fantom_testnet'],
  currency: {
   symbol: 'FTM',
   iconURL: 'https://cryptologos.cc/logos/fantom-ftm-logo.png'
  },
  explorerURL: 'https://testnet.ftmscan.com'
 },
 {
  id: 14,
  name: 'Arbitrum One - Mainnet',
  chainID: 42161,
  rpcURLs: ['https://arb1.arbitrum.io/rpc', 'https://arbitrum-mainnet.public.blastapi.io', 'https://rpc.ankr.com/arbitrum', 'https://arb-mainnet.g.alchemy.com/v2/YOUR-API-KEY'],
  currency: {
   symbol: 'ETH',
   iconURL: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
  },
  explorerURL: 'https://arbiscan.io'
 },
 {
  id: 15,
  name: 'Arbitrum One - Goerli Testnet',
  chainID: 421613,
  rpcURLs: ['https://goerli-rollup.arbitrum.io/rpc', 'https://arbitrum-goerli.public.blastapi.io', 'https://arb-goerli.g.alchemy.com/v2/YOUR-API-KEY', 'https://rpc.ankr.com/arbitrum_goerli'],
  currency: {
   symbol: 'ETH',
   iconURL: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
  },
  explorerURL: 'https://goerli.arbiscan.io'
 },
 {
  id: 16,
  name: 'Optimism - Mainnet',
  chainID: 10,
  rpcURLs: ['https://mainnet.optimism.io', 'https://optimism-mainnet.public.blastapi.io', 'https://rpc.ankr.com/optimism', 'https://opt-mainnet.g.alchemy.com/v2/YOUR-API-KEY'],
  currency: {
   symbol: 'ETH',
   iconURL: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
  },
  explorerURL: 'https://optimistic.etherscan.io'
 },
 {
  id: 17,
  name: 'Optimism - Goerli Testnet',
  chainID: 420,
  rpcURLs: ['https://goerli.optimism.io', 'https://optimism-goerli.public.blastapi.io', 'https://opt-goerli.g.alchemy.com/v2/YOUR-API-KEY', 'https://rpc.ankr.com/optimism_testnet'],
  currency: {
   symbol: 'ETH',
   iconURL: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
  },
  explorerURL: 'https://goerli-optimistic.etherscan.io'
 },
 {
  id: 18,
  name: 'Cronos - Mainnet',
  chainID: 25,
  rpcURLs: ['https://evm.cronos.org', 'https://cronosrpc-1.xstaking.sg', 'https://rpc.ankr.com/cronos', 'https://node.croswap.com/rpc'],
  currency: {
   symbol: 'CRO',
   iconURL: 'https://cryptologos.cc/logos/cronos-cro-logo.png'
  },
  explorerURL: 'https://cronoscan.com'
 },
 {
  id: 19,
  name: 'Cronos - Testnet',
  chainID: 338,
  rpcURLs: ['https://evm-t3.cronos.org', 'https://cronos-testnet-3.crypto.org:8545', 'https://rpc.ankr.com/cronos_testnet'],
  currency: {
   symbol: 'tCRO',
   iconURL: 'https://cryptologos.cc/logos/cronos-cro-logo.png'
  },
  explorerURL: 'https://testnet.cronoscan.com'
 },
 {
  id: 20,
  name: 'zkSync Era - Mainnet',
  chainID: 324,
  rpcURLs: ['https://mainnet.era.zksync.io', 'https://zksync2-mainnet.zksync.io', 'https://rpc.ankr.com/zksync_era'],
  currency: {
   symbol: 'ETH',
   iconURL: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
  },
  explorerURL: 'https://explorer.zksync.io'
 },
 {
  id: 21,
  name: 'zkSync Era - Testnet',
  chainID: 280,
  rpcURLs: ['https://testnet.era.zksync.dev', 'https://zksync2-testnet.zksync.dev', 'https://rpc.ankr.com/zksync_era_testnet'],
  currency: {
   symbol: 'ETH',
   iconURL: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
  },
  explorerURL: 'https://goerli.explorer.zksync.io'
 },
 {
  id: 22,
  name: 'Moonbeam - Mainnet',
  chainID: 1284,
  rpcURLs: ['https://rpc.api.moonbeam.network', 'https://moonbeam.public.blastapi.io', 'https://rpc.ankr.com/moonbeam'],
  currency: {
   symbol: 'GLMR',
   iconURL: 'https://cryptologos.cc/logos/moonbeam-glmr-logo.png'
  },
  explorerURL: 'https://moonscan.io'
 },
 {
  id: 23,
  name: 'Moonbase - Alpha Testnet',
  chainID: 1287,
  rpcURLs: ['https://rpc.api.moonbase.moonbeam.network', 'https://moonbase-alpha.public.blastapi.io', 'https://rpc.ankr.com/moonbeam_testnet'],
  currency: {
   symbol: 'DEV',
   iconURL: 'https://cryptologos.cc/logos/moonbeam-glmr-logo.png'
  },
  explorerURL: 'https://moonbase.moonscan.io'
 },
 {
  id: 24,
  name: 'Celo - Mainnet',
  chainID: 42220,
  rpcURLs: ['https://forno.celo.org', 'https://rpc.ankr.com/celo', 'https://celo-mainnet.public.blastapi.io'],
  currency: {
   symbol: 'CELO',
   iconURL: 'https://cryptologos.cc/logos/celo-celo-logo.png'
  },
  explorerURL: 'https://explorer.celo.org'
 },
 {
  id: 25,
  name: 'Celo - Alfajores Testnet',
  chainID: 44787,
  rpcURLs: ['https://alfajores-forno.celo-testnet.org', 'https://rpc.ankr.com/celo_alfajores', 'https://alfajores.celo-testnet.public.blastapi.io'],
  currency: {
   symbol: 'CELO',
   iconURL: 'https://cryptologos.cc/logos/celo-celo-logo.png'
  },
  explorerURL: 'https://alfajores-blockscout.celo-testnet.org'
 },
 {
  id: 26,
  name: 'Gnosis - Mainnet',
  chainID: 100,
  rpcURLs: ['https://rpc.gnosischain.com', 'https://gnosis-mainnet.public.blastapi.io', 'https://rpc.ankr.com/gnosis'],
  currency: {
   symbol: 'xDAI',
   iconURL: 'https://cryptologos.cc/logos/xdai-stake-xdai-logo.png'
  },
  explorerURL: 'https://blockscout.com/xdai/mainnet'
 },
 {
  id: 27,
  name: 'Gnosis - Chiado Testnet',
  chainID: 10200,
  rpcURLs: ['https://rpc.chiadochain.net', 'https://gnosis-testnet.public.blastapi.io', 'https://rpc.ankr.com/gnosis_chiado'],
  currency: {
   symbol: 'xDAI',
   iconURL: 'https://cryptologos.cc/logos/xdai-stake-xdai-logo.png'
  },
  explorerURL: 'https://blockscout.com/gnosis/chiado'
 },
 {
  id: 28,
  name: 'Klaytn - Mainnet',
  chainID: 8217,
  rpcURLs: ['https://public-node-api.klaytnapi.com/v1/cypress', 'https://klaytn01.fandom.finance', 'https://klaytn.rpc.thirdweb.com'],
  currency: {
   symbol: 'KLAY',
   iconURL: 'https://cryptologos.cc/logos/klaytn-klay-logo.png'
  },
  explorerURL: 'https://scope.klaytn.com'
 },
 {
  id: 29,
  name: 'Klaytn - Baobab Testnet',
  chainID: 1001,
  rpcURLs: ['https://api.baobab.klaytn.net:8651', 'https://klaytn-baobab.blockpi.network/v1/rpc/public', 'https://klaytn-testnet.rpc.thirdweb.com'],
  currency: {
   symbol: 'KLAY',
   iconURL: 'https://cryptologos.cc/logos/klaytn-klay-logo.png'
  },
  explorerURL: 'https://baobab.scope.klaytn.com'
 },
 {
  id: 30,
  name: 'Velas - Mainnet',
  chainID: 106,
  rpcURLs: ['https://evmexplorer.velas.com/rpc', 'https://velas-mainnet.public.blastapi.io', 'https://rpc.velas.com'],
  currency: {
   symbol: 'VLX',
   iconURL: 'https://cryptologos.cc/logos/velas-vlx-logo.png'
  },
  explorerURL: 'https://evmexplorer.velas.com'
 },
 {
  id: 31,
  name: 'Velas - Testnet',
  chainID: 111,
  rpcURLs: ['https://testnet.velas.com/rpc', 'https://velas-testnet.public.blastapi.io', 'https://rpc-testnet.velas.com'],
  currency: {
   symbol: 'VLX',
   iconURL: 'https://cryptologos.cc/logos/velas-vlx-logo.png'
  },
  explorerURL: 'https://evmexplorer.testnet.velas.com'
 },
 {
  id: 32,
  name: 'Harmony - Mainnet Shard 0',
  chainID: 1666600000,
  rpcURLs: ['https://api.harmony.one', 'https://harmony-0-rpc.gateway.pokt.network', 'https://rpc.ankr.com/harmony'],
  currency: {
   symbol: 'ONE',
   iconURL: 'https://cryptologos.cc/logos/harmony-one-logo.png'
  },
  explorerURL: 'https://explorer.harmony.one'
 },
 {
  id: 33,
  name: 'Harmony - Testnet Shard 0',
  chainID: 1666700000,
  rpcURLs: ['https://api.s0.b.hmny.io', 'https://rpc.ankr.com/harmony_testnet', 'https://harmony-testnet.public.blastapi.io'],
  currency: {
   symbol: 'ONE',
   iconURL: 'https://cryptologos.cc/logos/harmony-one-logo.png'
  },
  explorerURL: 'https://explorer.testnet.harmony.one'
 },
 {
  id: 34,
  name: 'Aurora - Mainnet',
  chainID: 1313161554,
  rpcURLs: ['https://mainnet.aurora.dev', 'https://aurora-mainnet.public.blastapi.io', 'https://rpc.ankr.com/aurora'],
  currency: {
   symbol: 'ETH',
   iconURL: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
  },
  explorerURL: 'https://aurorascan.dev'
 },
 {
  id: 35,
  name: 'Aurora - Testnet',
  chainID: 1313161555,
  rpcURLs: ['https://testnet.aurora.dev', 'https://aurora-testnet.public.blastapi.io', 'https://rpc.ankr.com/aurora_testnet'],
  currency: {
   symbol: 'ETH',
   iconURL: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
  },
  explorerURL: 'https://testnet.aurorascan.dev'
 },
 {
  id: 36,
  name: 'Metis Andromeda - Mainnet',
  chainID: 1088,
  rpcURLs: ['https://andromeda.metis.io/?owner=1088', 'https://metis-mainnet.public.blastapi.io', 'https://rpc.ankr.com/metis'],
  currency: {
   symbol: 'METIS',
   iconURL: 'https://cryptologos.cc/logos/metis-metis-logo.png'
  },
  explorerURL: 'https://andromeda-explorer.metis.io'
 },
 {
  id: 37,
  name: 'Metis Stardust - Testnet',
  chainID: 588,
  rpcURLs: ['https://stardust.metis.io/?owner=588', 'https://metis-testnet.public.blastapi.io', 'https://rpc.ankr.com/metis_testnet'],
  currency: {
   symbol: 'METIS',
   iconURL: 'https://cryptologos.cc/logos/metis-metis-logo.png'
  },
  explorerURL: 'https://stardust-explorer.metis.io'
 },
 {
  id: 38,
  name: 'Fuse - Mainnet',
  chainID: 122,
  rpcURLs: ['https://rpc.fuse.io', 'https://fuse-mainnet.public.blastapi.io', 'https://rpc.ankr.com/fuse'],
  currency: {
   symbol: 'FUSE',
   iconURL: 'https://cryptologos.cc/logos/fuse-fuse-logo.png'
  },
  explorerURL: 'https://explorer.fuse.io'
 },
 {
  id: 39,
  name: 'Fuse Spark - Testnet',
  chainID: 123,
  rpcURLs: ['https://rpc.fusespark.io', 'https://fuse-testnet.public.blastapi.io', 'https://rpc.ankr.com/fuse_testnet'],
  currency: {
   symbol: 'FUSE',
   iconURL: 'https://cryptologos.cc/logos/fuse-fuse-logo.png'
  },
  explorerURL: 'https://explorer.fusespark.io'
 },
 {
  id: 40,
  name: 'ThunderCore - Mainnet',
  chainID: 108,
  rpcURLs: ['https://mainnet-rpc.thundercore.com', 'https://thundercore-mainnet.public.blastapi.io', 'https://rpc.ankr.com/thundercore'],
  currency: {
   symbol: 'TT',
   iconURL: 'https://cryptologos.cc/logos/thundercore-tt-logo.png'
  },
  explorerURL: 'https://viewblock.io/thundercore'
 },
 {
  id: 41,
  name: 'ThunderCore - Testnet',
  chainID: 18,
  rpcURLs: ['https://testnet-rpc.thundercore.com', 'https://thundercore-testnet.public.blastapi.io', 'https://rpc.ankr.com/thundercore_testnet'],
  currency: {
   symbol: 'TST',
   iconURL: 'https://cryptologos.cc/logos/thundercore-tt-logo.png'
  },
  explorerURL: 'https://explorer-testnet.thundercore.com'
 },
 {
  id: 42,
  name: 'Telos EVM - Mainnet',
  chainID: 40,
  rpcURLs: ['https://mainnet.telos.net/evm', 'https://telos-evm-mainnet.public.blastapi.io', 'https://rpc.ankr.com/telos'],
  currency: {
   symbol: 'TLOS',
   iconURL: 'https://cryptologos.cc/logos/telos-tlos-logo.png'
  },
  explorerURL: 'https://teloscan.io'
 },
 {
  id: 43,
  name: 'Telos EVM - Testnet',
  chainID: 41,
  rpcURLs: ['https://testnet.telos.net/evm', 'https://telos-evm-testnet.public.blastapi.io', 'https://rpc.ankr.com/telos_testnet'],
  currency: {
   symbol: 'TLOS',
   iconURL: 'https://cryptologos.cc/logos/telos-tlos-logo.png'
  },
  explorerURL: 'https://testnet.teloscan.io'
 },
 {
  id: 44,
  name: 'Moonriver - Mainnet',
  chainID: 1285,
  rpcURLs: ['https://rpc.api.moonriver.moonbeam.network', 'https://moonriver.public.blastapi.io', 'https://rpc.ankr.com/moonriver'],
  currency: {
   symbol: 'MOVR',
   iconURL: 'https://cryptologos.cc/logos/moonriver-movr-logo.png'
  },
  explorerURL: 'https://moonriver.moonscan.io'
 },
 {
  id: 45,
  name: 'Moonriver - Testnet',
  chainID: 1287,
  rpcURLs: ['https://rpc.api.moonbase.moonbeam.network', 'https://moonbase-alpha.public.blastapi.io', 'https://rpc.ankr.com/moonbeam_testnet'],
  currency: {
   symbol: 'DEV',
   iconURL: 'https://cryptologos.cc/logos/moonbeam-glmr-logo.png'
  },
  explorerURL: 'https://moonbase.moonscan.io'
 },
 {
  id: 46,
  name: 'RSK - Mainnet',
  chainID: 30,
  rpcURLs: ['https://public-node.rsk.co', 'https://rsk.public.blastapi.io', 'https://rpc.ankr.com/rsk'],
  currency: {
   symbol: 'RBTC',
   iconURL: 'https://cryptologos.cc/logos/rsk-rbtc-logo.png'
  },
  explorerURL: 'https://explorer.rsk.co'
 },
 {
  id: 47,
  name: 'RSK - Testnet',
  chainID: 31,
  rpcURLs: ['https://public-node.testnet.rsk.co', 'https://rsk-testnet.public.blastapi.io', 'https://rpc.ankr.com/rsk_testnet'],
  currency: {
   symbol: 'tRBTC',
   iconURL: 'https://cryptologos.cc/logos/rsk-rbtc-logo.png'
  },
  explorerURL: 'https://explorer.testnet.rsk.co'
 },
 {
  id: 48,
  name: 'Astar - Mainnet',
  chainID: 592,
  rpcURLs: ['https://evm.astar.network', 'https://astar-mainnet.public.blastapi.io', 'https://rpc.ankr.com/astar'],
  currency: {
   symbol: 'ASTR',
   iconURL: 'https://cryptologos.cc/logos/astar-astr-logo.png'
  },
  explorerURL: 'https://blockscout.com/astar'
 },
 {
  id: 49,
  name: 'Astar - Shiden Testnet',
  chainID: 336,
  rpcURLs: ['https://rpc.shiden.astar.network', 'https://shiden-testnet.public.blastapi.io', 'https://rpc.ankr.com/astar_shiden'],
  currency: {
   symbol: 'SDN',
   iconURL: 'https://cryptologos.cc/logos/astar-astr-logo.png'
  },
  explorerURL: 'https://blockscout.com/shiden'
 },
 {
  id: 50,
  name: 'KCC - Mainnet',
  chainID: 321,
  rpcURLs: ['https://rpc-mainnet.kcc.network', 'https://kcc-mainnet.public.blastapi.io', 'https://rpc.ankr.com/kcc'],
  currency: {
   symbol: 'KCS',
   iconURL: 'https://cryptologos.cc/logos/kucoin-shares-kcs-logo.png'
  },
  explorerURL: 'https://explorer.kcc.io'
 },
 {
  id: 51,
  name: 'KCC - Testnet',
  chainID: 322,
  rpcURLs: ['https://rpc-testnet.kcc.network', 'https://kcc-testnet.public.blastapi.io', 'https://rpc.ankr.com/kcc_testnet'],
  currency: {
   symbol: 'KCS',
   iconURL: 'https://cryptologos.cc/logos/kucoin-shares-kcs-logo.png'
  },
  explorerURL: 'https://scan-testnet.kcc.network'
 },
 {
  id: 52,
  name: 'Hoo Smart Chain - Mainnet',
  chainID: 70,
  rpcURLs: ['https://http-mainnet.hoosmartchain.com', 'https://hoo-mainnet.public.blastapi.io', 'https://rpc.ankr.com/hoo'],
  currency: {
   symbol: 'HOO',
   iconURL: 'https://cryptologos.cc/logos/hoo-token-hoo-logo.png'
  },
  explorerURL: 'https://hooscan.com'
 },
 {
  id: 53,
  name: 'Hoo Smart Chain - Testnet',
  chainID: 170,
  rpcURLs: ['https://http-testnet.hoosmartchain.com', 'https://hoo-testnet.public.blastapi.io', 'https://rpc.ankr.com/hoo_testnet'],
  currency: {
   symbol: 'HOO',
   iconURL: 'https://cryptologos.cc/logos/hoo-token-hoo-logo.png'
  },
  explorerURL: 'https://testnet.hooscan.com'
 },
 {
  id: 54,
  name: 'Emerald Paratime (Oasis Network) - Mainnet',
  chainID: 42262,
  rpcURLs: ['https://emerald.oasis.dev', 'https://emerald-mainnet.public.blastapi.io', 'https://rpc.ankr.com/oasis_emerald'],
  currency: {
   symbol: 'ROSE',
   iconURL: 'https://cryptologos.cc/logos/oasis-network-rose-logo.png'
  },
  explorerURL: 'https://explorer.emerald.oasis.dev'
 },
 {
  id: 55,
  name: 'Emerald Paratime (Oasis Network) - Testnet',
  chainID: 42261,
  rpcURLs: ['https://testnet.emerald.oasis.dev', 'https://emerald-testnet.public.blastapi.io', 'https://rpc.ankr.com/oasis_emerald_testnet'],
  currency: {
   symbol: 'ROSE',
   iconURL: 'https://cryptologos.cc/logos/oasis-network-rose-logo.png'
  },
  explorerURL: 'https://testnet.explorer.emerald.oasis.dev'
 },
 {
  id: 56,
  name: 'Songbird - Mainnet',
  chainID: 19,
  rpcURLs: ['https://songbird-api.flare.network/ext/C/rpc', 'https://songbird.public.blastapi.io', 'https://rpc.ankr.com/songbird'],
  currency: {
   symbol: 'SGB',
   iconURL: 'https://cryptologos.cc/logos/songbird-sgb-logo.png'
  },
  explorerURL: 'https://songbird-explorer.flare.network'
 },
 {
  id: 57,
  name: 'Songbird - Testnet',
  chainID: 16,
  rpcURLs: ['https://songbird-testnet.flare.network/ext/C/rpc', 'https://songbird-testnet.public.blastapi.io', 'https://rpc.ankr.com/songbird_testnet'],
  currency: {
   symbol: 'SGB',
   iconURL: 'https://cryptologos.cc/logos/songbird-sgb-logo.png'
  },
  explorerURL: 'https://songbird-testnet-explorer.flare.network'
 },
 {
  id: 58,
  name: 'OKXChain - Mainnet',
  chainID: 66,
  rpcURLs: ['https://exchainrpc.okex.org', 'https://okc-mainnet.public.blastapi.io', 'https://rpc.ankr.com/okxchain'],
  currency: {
   symbol: 'OKT',
   iconURL: 'https://cryptologos.cc/logos/okb-okb-logo.png'
  },
  explorerURL: 'https://www.oklink.com/en/okc'
 },
 {
  id: 59,
  name: 'OKXChain - Testnet',
  chainID: 65,
  rpcURLs: ['https://exchaintestrpc.okex.org', 'https://okc-testnet.public.blastapi.io', 'https://rpc.ankr.com/okxchain_testnet'],
  currency: {
   symbol: 'OKT',
   iconURL: 'https://cryptologos.cc/logos/okb-okb-logo.png'
  },
  explorerURL: 'https://www.oklink.com/en/okc-test'
 },
 {
  id: 60,
  name: 'Smart Bitcoin Cash (SmartBCH) - Mainnet',
  chainID: 10000,
  rpcURLs: ['https://smartbch.greyh.at', 'https://rpc.smartbch.org', 'https://smartbch.fountainhead.cash/mainnet'],
  currency: {
   symbol: 'BCH',
   iconURL: 'https://cryptologos.cc/logos/bitcoin-cash-bch-logo.png'
  },
  explorerURL: 'https://www.smartscan.cash'
 },
 {
  id: 61,
  name: 'Smart Bitcoin Cash (SmartBCH) - Testnet',
  chainID: 10001,
  rpcURLs: ['https://rpc-testnet.smartbch.org', 'https://smartbch-testnet.fountainhead.cash'],
  currency: {
   symbol: 'BCH',
   iconURL: 'https://cryptologos.cc/logos/bitcoin-cash-bch-logo.png'
  },
  explorerURL: 'https://www.smartscan.cash/testnet'
 },
 {
  id: 62,
  name: 'Wanchain - Mainnet',
  chainID: 888,
  rpcURLs: ['https://gwan-ssl.wandevs.org:56891', 'https://wanchain-mainnet.public.blastapi.io', 'https://rpc.ankr.com/wanchain'],
  currency: {
   symbol: 'WAN',
   iconURL: 'https://cryptologos.cc/logos/wanchain-wan-logo.png'
  },
  explorerURL: 'https://www.wanscan.org'
 },
 {
  id: 63,
  name: 'Wanchain - Testnet',
  chainID: 999,
  rpcURLs: ['https://gwan-ssl.wandevs.org:46891', 'https://wanchain-testnet.public.blastapi.io', 'https://rpc.ankr.com/wanchain_testnet'],
  currency: {
   symbol: 'WAN',
   iconURL: 'https://cryptologos.cc/logos/wanchain-wan-logo.png'
  },
  explorerURL: 'https://testnet.wanscan.org'
 },
 {
  id: 64,
  name: 'Palm Network - Mainnet',
  chainID: 11297108109,
  rpcURLs: ['https://palm-mainnet.infura.io/v3/YOUR-PROJECT-ID', 'https://palm-mainnet.public.blastapi.io', 'https://rpc.ankr.com/palm'],
  currency: {
   symbol: 'PALM',
   iconURL: 'https://cryptologos.cc/logos/palm-palm-logo.png'
  },
  explorerURL: 'https://explorer.palm.io'
 },
 {
  id: 65,
  name: 'Palm Network - Testnet',
  chainID: 11297108099,
  rpcURLs: ['https://palm-testnet.infura.io/v3/YOUR-PROJECT-ID', 'https://palm-testnet.public.blastapi.io', 'https://rpc.ankr.com/palm_testnet'],
  currency: {
   symbol: 'PALM',
   iconURL: 'https://cryptologos.cc/logos/palm-palm-logo.png'
  },
  explorerURL: 'https://explorer.palm.io'
 },
 {
  id: 66,
  name: 'Kava EVM - Mainnet',
  chainID: 2222,
  rpcURLs: ['https://evm.kava.io', 'https://kava-mainnet.public.blastapi.io', 'https://rpc.ankr.com/kava'],
  currency: {
   symbol: 'KAVA',
   iconURL: 'https://cryptologos.cc/logos/kava-kava-logo.png'
  },
  explorerURL: 'https://explorer.kava.io'
 },
 {
  id: 67,
  name: 'Kava EVM - Testnet',
  chainID: 2221,
  rpcURLs: ['https://evm.testnet.kava.io', 'https://kava-testnet.public.blastapi.io', 'https://rpc.ankr.com/kava_testnet'],
  currency: {
   symbol: 'KAVA',
   iconURL: 'https://cryptologos.cc/logos/kava-kava-logo.png'
  },
  explorerURL: 'https://explorer.testnet.kava.io'
 },
 {
  id: 68,
  name: 'Evmos - Mainnet',
  chainID: 9001,
  rpcURLs: ['https://evmos-rpc.evmos.org', 'https://evmos-mainnet.public.blastapi.io', 'https://rpc.ankr.com/evmos'],
  currency: {
   symbol: 'EVMOS',
   iconURL: 'https://cryptologos.cc/logos/evmos-evmos-logo.png'
  },
  explorerURL: 'https://evm.evmos.org'
 },
 {
  id: 69,
  name: 'Evmos - Testnet',
  chainID: 9000,
  rpcURLs: ['https://rpc.testnet.evmos.org', 'https://evmos-testnet.public.blastapi.io', 'https://rpc.ankr.com/evmos_testnet'],
  currency: {
   symbol: 'EVMOS',
   iconURL: 'https://cryptologos.cc/logos/evmos-evmos-logo.png'
  },
  explorerURL: 'https://testnet.evmos.org'
 },
 {
  id: 70,
  name: 'BitTorrent Chain (BTTC) - Mainnet',
  chainID: 199,
  rpcURLs: ['https://rpc.bittorrentchain.io', 'https://bttc-mainnet.public.blastapi.io', 'https://rpc.ankr.com/bttc'],
  currency: {
   symbol: 'BTT',
   iconURL: 'https://cryptologos.cc/logos/bittorrent-btt-logo.png'
  },
  explorerURL: 'https://bttcscan.com'
 },
 {
  id: 71,
  name: 'BitTorrent Chain (BTTC) - Testnet',
  chainID: 1028,
  rpcURLs: ['https://test-rpc.bittorrentchain.io', 'https://bttc-testnet.public.blastapi.io', 'https://rpc.ankr.com/bttc_testnet'],
  currency: {
   symbol: 'BTT',
   iconURL: 'https://cryptologos.cc/logos/bittorrent-btt-logo.png'
  },
  explorerURL: 'https://testnet.bttcscan.com'
 },
 {
  id: 72,
  name: 'Edgeware - Mainnet',
  chainID: 2021,
  rpcURLs: ['https://mainnet1.edgewa.re', 'https://edgeware-mainnet.public.blastapi.io', 'https://rpc.ankr.com/edgeware'],
  currency: {
   symbol: 'EDG',
   iconURL: 'https://cryptologos.cc/logos/edgeware-edg-logo.png'
  },
  explorerURL: 'https://edgscan.live'
 },
 {
  id: 73,
  name: 'SX Network - Mainnet',
  chainID: 416,
  rpcURLs: ['https://rpc.sx.technology', 'https://sx-mainnet.public.blastapi.io', 'https://rpc.ankr.com/sxnetwork'],
  currency: {
   symbol: 'SX',
   iconURL: 'https://cryptologos.cc/logos/sx-network-sx-logo.png'
  },
  explorerURL: 'https://explorer.sx.technology'
 },
 {
  id: 74,
  name: 'Clover Finance - Mainnet',
  chainID: 1024,
  rpcURLs: ['https://rpc.clover.finance', 'https://clover-mainnet.public.blastapi.io', 'https://rpc.ankr.com/clover'],
  currency: {
   symbol: 'CLV',
   iconURL: 'https://cryptologos.cc/logos/clover-finance-clv-logo.png'
  },
  explorerURL: 'https://cloverexplorer.com'
 },
 {
  id: 75,
  name: 'Clover Finance - Testnet',
  chainID: 1234,
  rpcURLs: ['https://testnet.clover.finance/rpc', 'https://rpc.ankr.com/clover_testnet'],
  currency: {
   symbol: 'tCLV',
   iconURL: 'https://cryptologos.cc/logos/clover-finance-clv-logo.png'
  },
  explorerURL: 'https://testnet.cloverexplorer.com'
 },
 {
  id: 76,
  name: 'Meter.io - Mainnet',
  chainID: 82,
  rpcURLs: ['https://rpc.meter.io', 'https://meter-mainnet.public.blastapi.io', 'https://rpc.ankr.com/meter'],
  currency: {
   symbol: 'MTR',
   iconURL: 'https://cryptologos.cc/logos/meter-mtr-logo.png'
  },
  explorerURL: 'https://scan.meter.io'
 },
 {
  id: 77,
  name: 'Ontology EVM - Mainnet',
  chainID: 58,
  rpcURLs: ['https://dappnode1.ont.io:10339', 'https://ont-mainnet.public.blastapi.io', 'https://rpc.ankr.com/ontology'],
  currency: {
   symbol: 'ONT',
   iconURL: 'https://cryptologos.cc/logos/ontology-ont-logo.png'
  },
  explorerURL: 'https://explorer.ont.io'
 },
 {
  id: 78,
  name: 'Elastos EVM - Mainnet',
  chainID: 20,
  rpcURLs: ['https://api.elastos.io/evm', 'https://elastos-mainnet.public.blastapi.io', 'https://rpc.ankr.com/elastos'],
  currency: {
   symbol: 'ELA',
   iconURL: 'https://cryptologos.cc/logos/elastos-ela-logo.png'
  },
  explorerURL: 'https://explorer.elastos.org'
 },
 {
  id: 79,
  name: 'Elastos EVM - Testnet',
  chainID: 21,
  rpcURLs: ['https://api-testnet.elastos.io/evm', 'https://elastos-testnet.public.blastapi.io', 'https://rpc.ankr.com/elastos_testnet'],
  currency: {
   symbol: 'tELA',
   iconURL: 'https://cryptologos.cc/logos/elastos-ela-logo.png'
  },
  explorerURL: 'https://testnet.explorer.elastos.org'
 },
 {
  id: 80,
  name: 'Godwoken (Nervos Layer 2) - Mainnet',
  chainID: 71393,
  rpcURLs: ['https://godwoken-mainnet-v1.ckbapp.dev', 'https://godwoken-mainnet.public.blastapi.io', 'https://rpc.ankr.com/godwoken'],
  currency: {
   symbol: 'CKB',
   iconURL: 'https://cryptologos.cc/logos/nervos-network-ckb-logo.png'
  },
  explorerURL: 'https://explorer.nervos.org'
 },
 {
  id: 81,
  name: 'Godwoken (Nervos Layer 2) - Testnet',
  chainID: 71401,
  rpcURLs: ['https://godwoken-testnet-v1.ckbapp.dev', 'https://godwoken-testnet.public.blastapi.io', 'https://rpc.ankr.com/godwoken_testnet'],
  currency: {
   symbol: 'CKB',
   iconURL: 'https://cryptologos.cc/logos/nervos-network-ckb-logo.png'
  },
  explorerURL: 'https://explorer.testnet.nervos.org'
 },
 {
  id: 82,
  name: 'REI Network (dříve GXChain) - Mainnet',
  chainID: 47805,
  rpcURLs: ['https://rei-rpc.meter.io', 'https://rei-mainnet.public.blastapi.io', 'https://rpc.ankr.com/rei'],
  currency: {
   symbol: 'REI',
   iconURL: 'https://cryptologos.cc/logos/rei-network-rei-logo.png'
  },
  explorerURL: 'https://scan.rei.network'
 },
 {
  id: 83,
  name: 'REI Network (dříve GXChain) - Testnet',
  chainID: 47905,
  rpcURLs: ['https://testnet-rpc.rei.network', 'https://rei-testnet.public.blastapi.io', 'https://rpc.ankr.com/rei_testnet'],
  currency: {
   symbol: 'tREI',
   iconURL: 'https://cryptologos.cc/logos/rei-network-rei-logo.png'
  },
  explorerURL: 'https://scan-testnet.rei.network'
 },
 {
  id: 84,
  name: 'Shiden Network - Mainnet',
  chainID: 336,
  rpcURLs: ['https://rpc.shiden.astar.network', 'https://shiden-mainnet.public.blastapi.io', 'https://rpc.ankr.com/shiden'],
  currency: {
   symbol: 'SDN',
   iconURL: 'https://cryptologos.cc/logos/shiden-sdn-logo.png'
  },
  explorerURL: 'https://shiden.subscan.io'
 },
 {
  id: 85,
  name: 'Shibuya Testnet',
  chainID: 81,
  rpcURLs: ['https://rpc.shibuya.astar.network', 'https://shibuya-testnet.public.blastapi.io', 'https://rpc.ankr.com/shibuya_testnet'],
  currency: {
   symbol: 'tSDN',
   iconURL: 'https://cryptologos.cc/logos/shiden-sdn-logo.png'
  },
  explorerURL: 'https://testnet.subscan.io/shibuya'
 },
 {
  id: 86,
  name: 'Boba Network - Mainnet',
  chainID: 288,
  rpcURLs: ['https://mainnet.boba.network', 'https://boba-mainnet.public.blastapi.io', 'https://rpc.ankr.com/boba'],
  currency: {
   symbol: 'BOBA',
   iconURL: 'https://cryptologos.cc/logos/boba-network-boba-logo.png'
  },
  explorerURL: 'https://blockexplorer.boba.network'
 },
 {
  id: 87,
  name: 'Boba Network - Testnet',
  chainID: 28,
  rpcURLs: ['https://testnet.boba.network', 'https://boba-testnet.public.blastapi.io', 'https://rpc.ankr.com/boba_testnet'],
  currency: {
   symbol: 'BOBA',
   iconURL: 'https://cryptologos.cc/logos/boba-network-boba-logo.png'
  },
  explorerURL: 'https://testnet.blockexplorer.boba.network'
 },
 {
  id: 88,
  name: 'Syscoin NEVM - Mainnet',
  chainID: 57,
  rpcURLs: ['https://rpc.syscoin.org', 'https://syscoin-mainnet.public.blastapi.io', 'https://rpc.ankr.com/syscoin'],
  currency: {
   symbol: 'SYS',
   iconURL: 'https://cryptologos.cc/logos/syscoin-sys-logo.png'
  },
  explorerURL: 'https://explorer.syscoin.org'
 },
 {
  id: 89,
  name: 'Syscoin NEVM - Testnet',
  chainID: 5700,
  rpcURLs: ['https://rpc.tanenbaum.io', 'https://syscoin-testnet.public.blastapi.io', 'https://rpc.ankr.com/syscoin_testnet'],
  currency: {
   symbol: 'tSYS',
   iconURL: 'https://cryptologos.cc/logos/syscoin-sys-logo.png'
  },
  explorerURL: 'https://explorer.tanenbaum.io'
 },
 {
  id: 90,
  name: 'Huobi ECO Chain - Mainnet',
  chainID: 128,
  rpcURLs: ['https://http-mainnet.hecochain.com', 'https://heco.rpc.thirdweb.com', 'https://rpc.ankr.com/heco'],
  currency: {
   symbol: 'HT',
   iconURL: 'https://cryptologos.cc/logos/huobi-token-ht-logo.png'
  },
  explorerURL: 'https://hecoinfo.com'
 },
 {
  id: 91,
  name: 'Huobi ECO Chain - Testnet',
  chainID: 256,
  rpcURLs: ['https://http-testnet.hecochain.com', 'https://testnet.heco.rpc.thirdweb.com', 'https://rpc.ankr.com/heco_testnet'],
  currency: {
   symbol: 'HT',
   iconURL: 'https://cryptologos.cc/logos/huobi-token-ht-logo.png'
  },
  explorerURL: 'https://testnet.hecoinfo.com'
 },
 {
  id: 92,
  name: 'TomoChain - Mainnet',
  chainID: 88,
  rpcURLs: ['https://rpc.tomochain.com', 'https://tomochain-rpc.com'],
  currency: {
   symbol: 'TOMO',
   iconURL: 'https://cryptologos.cc/logos/tomochain-tomo-logo.png'
  },
  explorerURL: 'https://scan.tomochain.com'
 },
 {
  id: 93,
  name: 'TomoChain - Testnet',
  chainID: 89,
  rpcURLs: ['https://rpc-testnet.tomochain.com'],
  currency: {
   symbol: 'tTOMO',
   iconURL: 'https://cryptologos.cc/logos/tomochain-tomo-logo.png'
  },
  explorerURL: 'https://scan-testnet.tomochain.com'
 },
 {
  id: 94,
  name: 'Canto - Mainnet',
  chainID: 7700,
  rpcURLs: ['https://canto.slingshot.finance/rpc', 'https://rpc.ankr.com/canto'],
  currency: {
   symbol: 'CANTO',
   iconURL: 'https://cryptologos.cc/logos/canto-canto-logo.png'
  },
  explorerURL: 'https://evm.explorer.canto.io'
 },
 {
  id: 95,
  name: 'Canto - Testnet',
  chainID: 740,
  rpcURLs: ['https://canto-testnet-rpc.com', 'https://rpc.ankr.com/canto_testnet'],
  currency: {
   symbol: 'tCANTO',
   iconURL: 'https://cryptologos.cc/logos/canto-canto-logo.png'
  },
  explorerURL: 'https://testnet.evm.explorer.canto.io'
 },
 {
  id: 96,
  name: 'Canto - Kovan Testnet',
  chainID: 42,
  rpcURLs: ['https://kovan.canto.io/rpc', 'https://rpc.ankr.com/canto_kovan'],
  currency: {
   symbol: 'kCANTO',
   iconURL: 'https://cryptologos.cc/logos/canto-canto-logo.png'
  },
  explorerURL: 'https://kovan.evm.explorer.canto.io'
 },
 {
  id: 97,
  name: 'Energy Web Chain (EWC) - Mainnet',
  chainID: 246,
  rpcURLs: ['https://rpc.energyweb.org', 'https://mainnet.infura.io/v3/YOUR-PROJECT-ID'],
  currency: {
   symbol: 'EWT',
   iconURL: 'https://cryptologos.cc/logos/energy-web-token-ewt-logo.png'
  },
  explorerURL: 'https://explorer.energyweb.org'
 },
 {
  id: 98,
  name: 'Conflux EVM - Mainnet',
  chainID: 1030,
  rpcURLs: ['https://evm.confluxrpc.com', 'https://rpc.ankr.com/conflux'],
  currency: {
   symbol: 'CFX',
   iconURL: 'https://cryptologos.cc/logos/conflux-token-cfx-logo.png'
  },
  explorerURL: 'https://www.confluxscan.io'
 },
 {
  id: 99,
  name: 'IoTeX - Mainnet',
  chainID: 4689,
  rpcURLs: ['https://babel-api.mainnet.iotex.io', 'https://rpc.ankr.com/iotex'],
  currency: {
   symbol: 'IOTX',
   iconURL: 'https://cryptologos.cc/logos/iotex-iotx-logo.png'
  },
  explorerURL: 'https://iotexscan.io'
 },
 {
  id: 100,
  name: 'WAX EVM - Mainnet',
  chainID: 2001,
  rpcURLs: ['https://waxevm-rpc.com', 'https://rpc.ankr.com/wax_evm'],
  currency: {
   symbol: 'WAX',
   iconURL: 'https://cryptologos.cc/logos/wax-wax-logo.png'
  },
  explorerURL: 'https://evm.explorer.wax.io'
 },
 {
  id: 101,
  name: 'Polygon zkEVM - Mainnet',
  chainID: 1101,
  rpcURLs: ['https://polygon-zkevm.publicnode.com', 'https://rpc.ankr.com/polygon_zkevm'],
  currency: {
   symbol: 'MATIC',
   iconURL: 'https://cryptologos.cc/logos/polygon-matic-logo.png'
  },
  explorerURL: 'https://zkevm.polygonscan.com'
 },
 {
  id: 102,
  name: 'Polygon zkEVM - Testnet',
  chainID: 1442,
  rpcURLs: ['https://polygon-zkevm-testnet.publicnode.com', 'https://rpc.ankr.com/polygon_zkevm_testnet'],
  currency: {
   symbol: 'MATIC',
   iconURL: 'https://cryptologos.cc/logos/polygon-matic-logo.png'
  },
  explorerURL: 'https://testnet.polygonscan.com'
 },
 {
  id: 103,
  name: 'Scroll - Mainnet',
  chainID: 534354,
  rpcURLs: ['https://mainnet-rpc.scroll.io/l2', 'https://rpc.ankr.com/scroll_mainnet'],
  currency: {
   symbol: 'ETH',
   iconURL: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
  },
  explorerURL: 'https://mainnet.blockscout.scroll.io'
 },
 {
  id: 104,
  name: 'Scroll - Testnet',
  chainID: 534353,
  rpcURLs: ['https://alpha-rpc.scroll.io/l2', 'https://rpc.ankr.com/scroll_testnet'],
  currency: {
   symbol: 'ETH',
   iconURL: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
  },
  explorerURL: 'https://blockscout.scroll.io'
 },
 {
  id: 105,
  name: 'Base - Mainnet',
  chainID: 84531,
  rpcURLs: ['https://base-mainnet.infura.io/v3/YOUR-PROJECT-ID', 'https://rpc.base.org'],
  currency: {
   symbol: 'ETH',
   iconURL: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
  },
  explorerURL: 'https://basescan.org'
 },
 {
  id: 106,
  name: 'Base - Testnet',
  chainID: 84531,
  rpcURLs: ['https://base-goerli.infura.io/v3/YOUR-PROJECT-ID', 'https://rpc.testnet.base.org'],
  currency: {
   symbol: 'ETH',
   iconURL: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
  },
  explorerURL: 'https://goerli.basescan.org'
 },
 {
  id: 107,
  name: 'Linea - Mainnet',
  chainID: 59144,
  rpcURLs: ['https://rpc.linea.build', 'https://linea-rpc.ankr.com'],
  currency: {
   symbol: 'ETH',
   iconURL: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
  },
  explorerURL: 'https://explorer.linea.build'
 },
 {
  id: 108,
  name: 'Linea - Testnet',
  chainID: 59140,
  rpcURLs: ['https://rpc.testnet.linea.build', 'https://linea-testnet-rpc.ankr.com'],
  currency: {
   symbol: 'ETH',
   iconURL: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
  },
  explorerURL: 'https://testnet.explorer.linea.build'
 },
 {
  id: 109,
  name: 'Shardeum - Mainnet',
  chainID: 8081,
  rpcURLs: ['https://rpc.shardeum.org'],
  currency: {
   symbol: 'SHM',
   iconURL: 'https://cryptologos.cc/logos/shardeum-shm-logo.png'
  },
  explorerURL: 'https://explorer.shardeum.org'
 },
 {
  id: 110,
  name: 'Shardeum - Testnet',
  chainID: 8080,
  rpcURLs: ['https://rpc.testnet.shardeum.org'],
  currency: {
   symbol: 'tSHM',
   iconURL: 'https://cryptologos.cc/logos/shardeum-shm-logo.png'
  },
  explorerURL: 'https://testnet.explorer.shardeum.org'
 },
 {
  id: 111,
  name: 'Theta Network - Mainnet',
  chainID: 361,
  rpcURLs: ['https://mainnet-rpc.theta.network', 'https://theta-rpc.com'],
  currency: {
   symbol: 'THETA',
   iconURL: 'https://cryptologos.cc/logos/theta-th-logo.png'
  },
  explorerURL: 'https://explorer.thetatoken.org'
 },
 {
  id: 112,
  name: 'Theta Network - Testnet',
  chainID: 365,
  rpcURLs: ['https://testnet-rpc.theta.network', 'https://theta-testnet-rpc.com'],
  currency: {
   symbol: 'THETA',
   iconURL: 'https://cryptologos.cc/logos/theta-th-logo.png'
  },
  explorerURL: 'https://testnet.explorer.thetatoken.org'
 },
 {
  id: 113,
  name: 'Mantle - Mainnet',
  chainID: 5001,
  rpcURLs: ['https://rpc.mantle.xyz', 'https://mantle-mainnet.public.blastapi.io'],
  currency: {
   symbol: 'MNT',
   iconURL: 'https://cryptologos.cc/logos/mantle-mnt-logo.png'
  },
  explorerURL: 'https://explorer.mantle.xyz'
 },
 {
  id: 114,
  name: 'Mantle - Testnet',
  chainID: 5000,
  rpcURLs: ['https://rpc.testnet.mantle.xyz', 'https://mantle-testnet.public.blastapi.io'],
  currency: {
   symbol: 'tMNT',
   iconURL: 'https://cryptologos.cc/logos/mantle-mnt-logo.png'
  },
  explorerURL: 'https://testnet.explorer.mantle.xyz'
 },
 {
  id: 115,
  name: 'zkSpace - Mainnet',
  chainID: 54321,
  rpcURLs: ['https://rpc.zkspace.com', 'https://mainnet.zkspace.public.blastapi.io'],
  currency: {
   symbol: 'ZKS',
   iconURL: 'https://cryptologos.cc/logos/zkspace-zks-logo.png'
  },
  explorerURL: 'https://explorer.zkspace.com'
 },
 {
  id: 116,
  name: 'zkSpace - Testnet',
  chainID: 54322,
  rpcURLs: ['https://testnet-rpc.zkspace.com', 'https://testnet.zkspace.public.blastapi.io'],
  currency: {
   symbol: 'tZKS',
   iconURL: 'https://cryptologos.cc/logos/zkspace-zks-logo.png'
  },
  explorerURL: 'https://testnet.explorer.zkspace.com'
 },
 {
  id: 117,
  name: 'Taiko - Mainnet',
  chainID: 167002,
  rpcURLs: ['https://mainnet.taiko.xyz/rpc', 'https://taiko-mainnet.public.blastapi.io'],
  currency: {
   symbol: 'TAIKO',
   iconURL: 'https://cryptologos.cc/logos/taiko-taiko-logo.png'
  },
  explorerURL: 'https://explorer.taiko.xyz'
 },
 {
  id: 118,
  name: 'Taiko - Testnet',
  chainID: 167001,
  rpcURLs: ['https://testnet.taiko.xyz/rpc', 'https://taiko-testnet.public.blastapi.io'],
  currency: {
   symbol: 'tTAIKO',
   iconURL: 'https://cryptologos.cc/logos/taiko-taiko-logo.png'
  },
  explorerURL: 'https://testnet.explorer.taiko.xyz'
 },
 {
  id: 122,
  name: 'Constellation (Hypergraph) - Mainnet',
  chainID: 421620,
  rpcURLs: ['https://api.constellation.network/rpc', 'https://rpc.constellation.network'],
  currency: {
   symbol: 'DAG',
   iconURL: 'https://cryptologos.cc/logos/constellation-dag-logo.png'
  },
  explorerURL: 'https://explorer.constellation.network'
 },
 {
  id: 123,
  name: 'Constellation (Hypergraph) - Testnet',
  chainID: 421620,
  rpcURLs: ['https://rpc.testnet.constellation.network', 'https://constellation-testnet.public.blastapi.io'],
  currency: {
   symbol: 'DAG',
   iconURL: 'https://cryptologos.cc/logos/constellation-dag-logo.png'
  },
  explorerURL: 'https://explorer.testnet.constellation.network'
 },
 {
  id: 124,
  name: 'Clover Finance - Arbitrum - Mainnet',
  chainID: 42162,
  rpcURLs: ['https://clover-arbitrum.rpc.com', 'https://clover-arbitrum.public.blastapi.io'],
  currency: {
   symbol: 'CLV',
   iconURL: 'https://cryptologos.cc/logos/clover-finance-clv-logo.png'
  },
  explorerURL: 'https://explorer.clover.finance/arbitrum'
 },
 {
  id: 125,
  name: 'Clover Finance - Arbitrum - Testnet',
  chainID: 421611,
  rpcURLs: ['https://clover-arbitrum-testnet.rpc.com', 'https://clover-arbitrum-testnet.public.blastapi.io'],
  currency: {
   symbol: 'tCLV',
   iconURL: 'https://cryptologos.cc/logos/clover-finance-clv-logo.png'
  },
  explorerURL: 'https://explorer.clover.finance/arbitrum/testnet'
 },
 {
  id: 126,
  name: 'Zora - Mainnet',
  chainID: 1337,
  rpcURLs: ['https://rpc.zora.network', 'https://zora-mainnet.public.blastapi.io'],
  currency: {
   symbol: 'ZORA',
   iconURL: 'https://cryptologos.cc/logos/zora-zora-logo.png'
  },
  explorerURL: 'https://explorer.zora.network'
 },
 {
  id: 127,
  name: 'Zora - Testnet',
  chainID: 1338,
  rpcURLs: ['https://rpc.testnet.zora.network', 'https://zora-testnet.public.blastapi.io'],
  currency: {
   symbol: 'tZORA',
   iconURL: 'https://cryptologos.cc/logos/zora-zora-logo.png'
  },
  explorerURL: 'https://explorer.testnet.zora.network'
 }
];

export default {
 address,
 balance,
 networks,
 wallets
};