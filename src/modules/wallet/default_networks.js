import { writable } from 'svelte/store';
export const default_networks = writable([
 {
  name: 'Ethereum - Mainnet',
  chainID: 1,
  rpcURLs: ['https://cloudflare-eth.com', 'https://rpc.ankr.com/eth', 'https://main-rpc.linkpool.io', 'https://eth-rpc.gateway.pokt.network', 'https://mainnet-nethermind.blockscout.com', 'https://api.mycryptoapi.com/eth'],
  currency: {
   symbol: 'ETH',
   iconURL: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
  },
  explorerURL: 'https://etherscan.io',
 },
 {
  name: 'Ethereum - Goerli Testnet',
  chainID: 5,
  rpcURLs: ['https://goerli.infura.io/v3/YOUR-PROJECT-ID', 'https://eth-goerli.g.alchemy.com/v2/YOUR-API-KEY', 'https://rpc.goerli.mudit.blog/', 'https://rpc.ankr.com/eth_goerli', 'https://goerli.blockpi.network/v1/rpc/public'],
  currency: {
   symbol: 'ETH',
   iconURL: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
  },
  explorerURL: 'https://goerli.etherscan.io',
 },
 {
  name: 'Ethereum - Sepolia Testnet',
  chainID: 11155111,
  rpcURLs: ['https://sepolia.infura.io/v3/YOUR-PROJECT-ID', 'https://rpc.sepolia.org', 'https://sepolia.blockpi.network/v1/rpc/public'],
  currency: {
   symbol: 'ETH',
   iconURL: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
  },
  explorerURL: 'https://sepolia.etherscan.io',
 },
 {
  name: 'Ethereum - Ropsten Testnet (Deprecated)',
  chainID: 3,
  rpcURLs: ['https://ropsten.infura.io/v3/YOUR-PROJECT-ID', 'https://eth-ropsten.alchemyapi.io/v2/YOUR-API-KEY'],
  currency: {
   symbol: 'ETH',
   iconURL: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
  },
  explorerURL: 'https://ropsten.etherscan.io',
 },
 {
  name: 'Ethereum - Rinkeby Testnet (Deprecated)',
  chainID: 4,
  rpcURLs: ['https://rinkeby.infura.io/v3/YOUR-PROJECT-ID', 'https://eth-rinkeby.alchemyapi.io/v2/YOUR-API-KEY', 'https://rinkeby-light.eth.linkpool.io/'],
  currency: {
   symbol: 'ETH',
   iconURL: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
  },
  explorerURL: 'https://rinkeby.etherscan.io',
 },
 {
  name: 'Binance Smart Chain - Mainnet',
  chainID: 56,
  rpcURLs: ['https://bsc-dataseed.binance.org/', 'https://bsc-dataseed1.defibit.io/', 'https://bsc-dataseed1.ninicoin.io/', 'https://rpc.ankr.com/bsc', 'https://bscrpc.com'],
  currency: {
   symbol: 'BNB',
   iconURL: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.svg',
  },
  explorerURL: 'https://bscscan.com',
 },
 {
  name: 'Binance Smart Chain - Testnet',
  chainID: 97,
  rpcURLs: ['https://data-seed-prebsc-1-s1.binance.org:8545/', 'https://data-seed-prebsc-2-s2.binance.org:8545/', 'https://data-seed-prebsc-1-s3.binance.org:8545/', 'https://rpc.ankr.com/bsc_testnet_chapel'],
  currency: {
   symbol: 'tBNB',
   iconURL: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.svg',
  },
  explorerURL: 'https://testnet.bscscan.com',
 },
 {
  name: 'Polygon - Mainnet',
  chainID: 137,
  rpcURLs: ['https://polygon-rpc.com', 'https://rpc-mainnet.maticvigil.com/', 'https://rpc-mainnet.matic.network', 'https://rpc-mainnet.matic.quiknode.pro', 'https://matic-mainnet.chainstacklabs.com'],
  currency: {
   symbol: 'MATIC',
   iconURL: 'https://cryptologos.cc/logos/polygon-matic-logo.svg',
  },
  explorerURL: 'https://polygonscan.com',
 },
 {
  name: 'Polygon - Amoy Testnet',
  chainID: 80002,
  rpcURLs: ['https://rpc-amoy.polygon.technology', 'https://polygon-amoy.blockpi.network/v1/rpc/public', 'https://rpc.ankr.com/polygon_amoy', 'https://polygon-amoy.drpc.org', 'https://polygon-amoy.gateway.tenderly.co', 'https://polygon-amoy-bor-rpc.publicnode.com', 'wss://polygon-amoy-bor-rpc.publicnode.com'],
  currency: {
   symbol: 'MATIC',
   iconURL: 'https://cryptologos.cc/logos/polygon-matic-logo.svg',
  },
  explorerURL: 'https://amoy.polygonscan.com/',
 },
 {
  name: 'Avalanche - C-Chain Mainnet',
  chainID: 43114,
  rpcURLs: ['https://api.avax.network/ext/bc/C/rpc', 'https://rpc.ankr.com/avalanche', 'https://ava-mainnet.public.blastapi.io/ext/bc/C/rpc', 'https://avalanche-c-chain.publicnode.com'],
  currency: {
   symbol: 'AVAX',
   iconURL: 'https://cryptologos.cc/logos/avalanche-avax-logo.svg',
  },
  explorerURL: 'https://snowtrace.io',
 },
 {
  name: 'Avalanche - Fuji Testnet',
  chainID: 43113,
  rpcURLs: ['https://api.avax-test.network/ext/bc/C/rpc', 'https://rpc.ankr.com/avalanche_fuji', 'https://ava-testnet.public.blastapi.io/ext/bc/C/rpc'],
  currency: {
   symbol: 'AVAX',
   iconURL: 'https://cryptologos.cc/logos/avalanche-avax-logo.svg',
  },
  explorerURL: 'https://testnet.snowtrace.io',
 },
 {
  name: 'Fantom Opera - Mainnet',
  chainID: 250,
  rpcURLs: ['https://rpc.ftm.tools/', 'https://fantom-mainnet.public.blastapi.io', 'https://rpc.ankr.com/fantom', 'https://rpcapi.fantom.network'],
  currency: {
   symbol: 'FTM',
   iconURL: 'https://cryptologos.cc/logos/fantom-ftm-logo.svg',
  },
  explorerURL: 'https://ftmscan.com',
 },
 {
  name: 'Fantom Opera - Testnet',
  chainID: 4002,
  rpcURLs: ['https://rpc.testnet.fantom.network/', 'https://fantom-testnet.public.blastapi.io', 'https://rpc.ankr.com/fantom_testnet'],
  currency: {
   symbol: 'FTM',
   iconURL: 'https://cryptologos.cc/logos/fantom-ftm-logo.svg',
  },
  explorerURL: 'https://testnet.ftmscan.com',
 },
 {
  name: 'Arbitrum One - Mainnet',
  chainID: 42161,
  rpcURLs: ['https://arb1.arbitrum.io/rpc', 'https://arbitrum-mainnet.public.blastapi.io', 'https://rpc.ankr.com/arbitrum', 'https://arb-mainnet.g.alchemy.com/v2/YOUR-API-KEY'],
  currency: {
   symbol: 'ETH',
   iconURL: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
  },
  explorerURL: 'https://arbiscan.io',
 },
 {
  name: 'Arbitrum One - Goerli Testnet',
  chainID: 421613,
  rpcURLs: ['https://goerli-rollup.arbitrum.io/rpc', 'https://arbitrum-goerli.public.blastapi.io', 'https://arb-goerli.g.alchemy.com/v2/YOUR-API-KEY', 'https://rpc.ankr.com/arbitrum_goerli'],
  currency: {
   symbol: 'ETH',
   iconURL: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
  },
  explorerURL: 'https://goerli.arbiscan.io',
 },
 {
  name: 'Optimism - Mainnet',
  chainID: 10,
  rpcURLs: ['https://mainnet.optimism.io', 'https://optimism-mainnet.public.blastapi.io', 'https://rpc.ankr.com/optimism', 'https://opt-mainnet.g.alchemy.com/v2/YOUR-API-KEY'],
  currency: {
   symbol: 'ETH',
   iconURL: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
  },
  explorerURL: 'https://optimistic.etherscan.io',
 },
 {
  name: 'Optimism - Goerli Testnet',
  chainID: 420,
  rpcURLs: ['https://goerli.optimism.io', 'https://optimism-goerli.public.blastapi.io', 'https://opt-goerli.g.alchemy.com/v2/YOUR-API-KEY', 'https://rpc.ankr.com/optimism_testnet'],
  currency: {
   symbol: 'ETH',
   iconURL: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
  },
  explorerURL: 'https://goerli-optimistic.etherscan.io',
 },
 {
  name: 'Cronos - Mainnet',
  chainID: 25,
  rpcURLs: ['https://evm.cronos.org', 'https://cronosrpc-1.xstaking.sg', 'https://rpc.ankr.com/cronos', 'https://node.croswap.com/rpc'],
  currency: {
   symbol: 'CRO',
   iconURL: 'https://cryptologos.cc/logos/cronos-cro-logo.svg',
  },
  explorerURL: 'https://cronoscan.com',
 },
 {
  name: 'Cronos - Testnet',
  chainID: 338,
  rpcURLs: ['https://evm-t3.cronos.org', 'https://cronos-testnet-3.crypto.org:8545', 'https://rpc.ankr.com/cronos_testnet'],
  currency: {
   symbol: 'tCRO',
   iconURL: 'https://cryptologos.cc/logos/cronos-cro-logo.svg',
  },
  explorerURL: 'https://testnet.cronoscan.com',
 },
 {
  name: 'zkSync Era - Mainnet',
  chainID: 324,
  rpcURLs: ['https://mainnet.era.zksync.io', 'https://zksync2-mainnet.zksync.io', 'https://rpc.ankr.com/zksync_era'],
  currency: {
   symbol: 'ETH',
   iconURL: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
  },
  explorerURL: 'https://explorer.zksync.io',
 },
 {
  name: 'zkSync Era - Testnet',
  chainID: 280,
  rpcURLs: ['https://testnet.era.zksync.dev', 'https://zksync2-testnet.zksync.dev', 'https://rpc.ankr.com/zksync_era_testnet'],
  currency: {
   symbol: 'ETH',
   iconURL: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
  },
  explorerURL: 'https://goerli.explorer.zksync.io',
 },
 {
  name: 'Moonbeam - Mainnet',
  chainID: 1284,
  rpcURLs: ['https://rpc.api.moonbeam.network', 'https://moonbeam.public.blastapi.io', 'https://rpc.ankr.com/moonbeam'],
  currency: {
   symbol: 'GLMR',
   iconURL: 'https://cryptologos.cc/logos/moonbeam-glmr-logo.svg',
  },
  explorerURL: 'https://moonscan.io',
 },
 {
  name: 'Moonbase - Alpha Testnet',
  chainID: 1287,
  rpcURLs: ['https://rpc.api.moonbase.moonbeam.network', 'https://moonbase-alpha.public.blastapi.io', 'https://rpc.ankr.com/moonbeam_testnet'],
  currency: {
   symbol: 'DEV',
   iconURL: 'https://cryptologos.cc/logos/moonbeam-glmr-logo.svg',
  },
  explorerURL: 'https://moonbase.moonscan.io',
 },
 {
  name: 'Celo - Mainnet',
  chainID: 42220,
  rpcURLs: ['https://forno.celo.org', 'https://rpc.ankr.com/celo', 'https://celo-mainnet.public.blastapi.io'],
  currency: {
   symbol: 'CELO',
   iconURL: 'https://cryptologos.cc/logos/celo-celo-logo.svg',
  },
  explorerURL: 'https://explorer.celo.org',
 },
 {
  name: 'Celo - Alfajores Testnet',
  chainID: 44787,
  rpcURLs: ['https://alfajores-forno.celo-testnet.org', 'https://rpc.ankr.com/celo_alfajores', 'https://alfajores.celo-testnet.public.blastapi.io'],
  currency: {
   symbol: 'CELO',
   iconURL: 'https://cryptologos.cc/logos/celo-celo-logo.svg',
  },
  explorerURL: 'https://alfajores-blockscout.celo-testnet.org',
 },
 {
  name: 'Gnosis - Mainnet',
  chainID: 100,
  rpcURLs: ['https://rpc.gnosischain.com', 'https://gnosis-mainnet.public.blastapi.io', 'https://rpc.ankr.com/gnosis'],
  currency: {
   symbol: 'xDAI',
   iconURL: 'https://cryptologos.cc/logos/gnosis-gno-gno-logo.svg',
  },
  explorerURL: 'https://blockscout.com/xdai/mainnet',
 },
 {
  name: 'Gnosis - Chiado Testnet',
  chainID: 10200,
  rpcURLs: ['https://rpc.chiadochain.net', 'https://gnosis-testnet.public.blastapi.io', 'https://rpc.ankr.com/gnosis_chiado'],
  currency: {
   symbol: 'xDAI',
   iconURL: 'https://cryptologos.cc/logos/gnosis-gno-gno-logo.svg',
  },
  explorerURL: 'https://blockscout.com/gnosis/chiado',
 },
 {
  name: 'Klaytn - Mainnet',
  chainID: 8217,
  rpcURLs: ['https://public-node-api.klaytnapi.com/v1/cypress', 'https://klaytn01.fandom.finance', 'https://klaytn.rpc.thirdweb.com'],
  currency: {
   symbol: 'KLAY',
   iconURL: 'https://cryptologos.cc/logos/klaytn-klay-logo.svg',
  },
  explorerURL: 'https://scope.klaytn.com',
 },
 {
  name: 'Klaytn - Baobab Testnet',
  chainID: 1001,
  rpcURLs: ['https://api.baobab.klaytn.net:8651', 'https://klaytn-baobab.blockpi.network/v1/rpc/public', 'https://klaytn-testnet.rpc.thirdweb.com'],
  currency: {
   symbol: 'KLAY',
   iconURL: 'https://cryptologos.cc/logos/klaytn-klay-logo.svg',
  },
  explorerURL: 'https://baobab.scope.klaytn.com',
 },
 {
  name: 'Velas - Mainnet',
  chainID: 106,
  rpcURLs: ['https://evmexplorer.velas.com/rpc', 'https://velas-mainnet.public.blastapi.io', 'https://rpc.velas.com'],
  currency: {
   symbol: 'VLX',
   iconURL: 'https://cryptologos.cc/logos/velas-vlx-logo.svg',
  },
  explorerURL: 'https://evmexplorer.velas.com',
 },
 {
  name: 'Velas - Testnet',
  chainID: 111,
  rpcURLs: ['https://testnet.velas.com/rpc', 'https://velas-testnet.public.blastapi.io', 'https://rpc-testnet.velas.com'],
  currency: {
   symbol: 'VLX',
   iconURL: 'https://cryptologos.cc/logos/velas-vlx-logo.svg',
  },
  explorerURL: 'https://evmexplorer.testnet.velas.com',
 },
 {
  name: 'Harmony - Mainnet Shard 0',
  chainID: 1666600000,
  rpcURLs: ['https://api.harmony.one', 'https://harmony-0-rpc.gateway.pokt.network', 'https://rpc.ankr.com/harmony'],
  currency: {
   symbol: 'ONE',
   iconURL: 'https://cryptologos.cc/logos/harmony-one-logo.svg',
  },
  explorerURL: 'https://explorer.harmony.one',
 },
 {
  name: 'Harmony - Testnet Shard 0',
  chainID: 1666700000,
  rpcURLs: ['https://api.s0.b.hmny.io', 'https://rpc.ankr.com/harmony_testnet', 'https://harmony-testnet.public.blastapi.io'],
  currency: {
   symbol: 'ONE',
   iconURL: 'https://cryptologos.cc/logos/harmony-one-logo.svg',
  },
  explorerURL: 'https://explorer.testnet.harmony.one',
 },
 {
  name: 'Aurora - Mainnet',
  chainID: 1313161554,
  rpcURLs: ['https://mainnet.aurora.dev', 'https://aurora-mainnet.public.blastapi.io', 'https://rpc.ankr.com/aurora'],
  currency: {
   symbol: 'ETH',
   iconURL: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
  },
  explorerURL: 'https://aurorascan.dev',
 },
 {
  name: 'Aurora - Testnet',
  chainID: 1313161555,
  rpcURLs: ['https://testnet.aurora.dev', 'https://aurora-testnet.public.blastapi.io', 'https://rpc.ankr.com/aurora_testnet'],
  currency: {
   symbol: 'ETH',
   iconURL: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
  },
  explorerURL: 'https://testnet.aurorascan.dev',
 },
 {
  name: 'Metis Andromeda - Mainnet',
  chainID: 1088,
  rpcURLs: ['https://andromeda.metis.io/?owner=1088', 'https://metis-mainnet.public.blastapi.io', 'https://rpc.ankr.com/metis'],
  currency: {
   symbol: 'METIS',
   iconURL: 'https://cryptologos.cc/logos/metisdao-metis-logo.svg',
  },
  explorerURL: 'https://andromeda-explorer.metis.io',
 },
 {
  name: 'Metis Stardust - Testnet',
  chainID: 588,
  rpcURLs: ['https://stardust.metis.io/?owner=588', 'https://metis-testnet.public.blastapi.io', 'https://rpc.ankr.com/metis_testnet'],
  currency: {
   symbol: 'METIS',
   iconURL: 'https://cryptologos.cc/logos/metisdao-metis-logo.svg',
  },
  explorerURL: 'https://stardust-explorer.metis.io',
 },
 {
  name: 'Fuse - Mainnet',
  chainID: 122,
  rpcURLs: ['https://rpc.fuse.io', 'https://fuse-mainnet.public.blastapi.io', 'https://rpc.ankr.com/fuse'],
  currency: {
   symbol: 'FUSE',
   iconURL: 'https://docs.fuse.io/img/logo.svg',
  },
  explorerURL: 'https://explorer.fuse.io',
 },
 {
  name: 'Fuse Spark - Testnet',
  chainID: 123,
  rpcURLs: ['https://rpc.fusespark.io', 'https://fuse-testnet.public.blastapi.io', 'https://rpc.ankr.com/fuse_testnet'],
  currency: {
   symbol: 'FUSE',
   iconURL: 'https://docs.fuse.io/img/logo.svg',
  },
  explorerURL: 'https://explorer.fusespark.io',
 },
 {
  name: 'ThunderCore - Mainnet',
  chainID: 108,
  rpcURLs: ['https://mainnet-rpc.thundercore.com', 'https://thundercore-mainnet.public.blastapi.io', 'https://rpc.ankr.com/thundercore'],
  currency: {
   symbol: 'TT',
   iconURL: 'https://logotyp.us/file/thunder-token.svg',
  },
  explorerURL: 'https://viewblock.io/thundercore',
 },
 {
  name: 'ThunderCore - Testnet',
  chainID: 18,
  rpcURLs: ['https://testnet-rpc.thundercore.com', 'https://thundercore-testnet.public.blastapi.io', 'https://rpc.ankr.com/thundercore_testnet'],
  currency: {
   symbol: 'TST',
   iconURL: 'https://logotyp.us/file/thunder-token.svg',
  },
  explorerURL: 'https://explorer-testnet.thundercore.com',
 },
 {
  name: 'Telos EVM - Mainnet',
  chainID: 40,
  rpcURLs: ['https://mainnet.telos.net/evm', 'https://telos-evm-mainnet.public.blastapi.io', 'https://rpc.ankr.com/telos'],
  currency: {
   symbol: 'TLOS',
   iconURL: 'https://logosandtypes.com/wp-content/uploads/2022/03/telos.svg',
  },
  explorerURL: 'https://teloscan.io',
 },
 {
  name: 'Telos EVM - Testnet',
  chainID: 41,
  rpcURLs: ['https://testnet.telos.net/evm', 'https://telos-evm-testnet.public.blastapi.io', 'https://rpc.ankr.com/telos_testnet'],
  currency: {
   symbol: 'TLOS',
   iconURL: 'https://logosandtypes.com/wp-content/uploads/2022/03/telos.svg',
  },
  explorerURL: 'https://testnet.teloscan.io',
 },
 {
  name: 'Moonriver - Mainnet',
  chainID: 1285,
  rpcURLs: ['https://rpc.api.moonriver.moonbeam.network', 'https://moonriver.public.blastapi.io', 'https://rpc.ankr.com/moonriver'],
  currency: {
   symbol: 'MOVR',
   iconURL: 'https://svgshare.com/i/1BAA.svg',
  },
  explorerURL: 'https://moonriver.moonscan.io',
 },
 {
  name: 'Moonriver - Testnet',
  chainID: 1287,
  rpcURLs: ['https://rpc.api.moonbase.moonbeam.network', 'https://moonbase-alpha.public.blastapi.io', 'https://rpc.ankr.com/moonbeam_testnet'],
  currency: {
   symbol: 'DEV',
   iconURL: 'https://svgshare.com/i/1BAA.svg',
  },
  explorerURL: 'https://moonbase.moonscan.io',
 },
 {
  name: 'RSK - Mainnet',
  chainID: 30,
  rpcURLs: ['https://public-node.rsk.co', 'https://rsk.public.blastapi.io', 'https://rpc.ankr.com/rsk'],
  currency: {
   symbol: 'RBTC',
   iconURL: 'https://cryptologos.cc/logos/rsk-infrastructure-framework-rif-logo.svg',
  },
  explorerURL: 'https://explorer.rsk.co',
 },
 {
  name: 'RSK - Testnet',
  chainID: 31,
  rpcURLs: ['https://public-node.testnet.rsk.co', 'https://rsk-testnet.public.blastapi.io', 'https://rpc.ankr.com/rsk_testnet'],
  currency: {
   symbol: 'tRBTC',
   iconURL: 'https://cryptologos.cc/logos/rsk-infrastructure-framework-rif-logo.svg',
  },
  explorerURL: 'https://explorer.testnet.rsk.co',
 },
 {
  name: 'Astar - Mainnet',
  chainID: 592,
  rpcURLs: ['https://evm.astar.network', 'https://astar-mainnet.public.blastapi.io', 'https://rpc.ankr.com/astar'],
  currency: {
   symbol: 'ASTR',
   iconURL: 'https://cryptologos.cc/logos/astar-astr-logo.svg',
  },
  explorerURL: 'https://blockscout.com/astar',
 },
 {
  name: 'Astar - Shiden Testnet',
  chainID: 336,
  rpcURLs: ['https://rpc.shiden.astar.network', 'https://shiden-testnet.public.blastapi.io', 'https://rpc.ankr.com/astar_shiden'],
  currency: {
   symbol: 'SDN',
   iconURL: 'https://cryptologos.cc/logos/astar-astr-logo.svg',
  },
  explorerURL: 'https://blockscout.com/shiden',
 },
 {
  name: 'KCC - Mainnet',
  chainID: 321,
  rpcURLs: ['https://rpc-mainnet.kcc.network', 'https://kcc-mainnet.public.blastapi.io', 'https://rpc.ankr.com/kcc'],
  currency: {
   symbol: 'KCS',
   iconURL: 'https://cryptologos.cc/logos/kucoin-shares-kcs-logo.svg',
  },
  explorerURL: 'https://explorer.kcc.io',
 },
 {
  name: 'KCC - Testnet',
  chainID: 322,
  rpcURLs: ['https://rpc-testnet.kcc.network', 'https://kcc-testnet.public.blastapi.io', 'https://rpc.ankr.com/kcc_testnet'],
  currency: {
   symbol: 'KCS',
   iconURL: 'https://cryptologos.cc/logos/kucoin-shares-kcs-logo.svg',
  },
  explorerURL: 'https://scan-testnet.kcc.network',
 },
 {
  name: 'Hoo Smart Chain - Mainnet',
  chainID: 70,
  rpcURLs: ['https://http-mainnet.hoosmartchain.com', 'https://hoo-mainnet.public.blastapi.io', 'https://rpc.ankr.com/hoo'],
  currency: {
   symbol: 'HOO',
   iconURL: 'https://cdn.brandfetch.io/idCSSGfr4Q/theme/dark/logo.svg',
  },
  explorerURL: 'https://hooscan.com',
 },
 {
  name: 'Hoo Smart Chain - Testnet',
  chainID: 170,
  rpcURLs: ['https://http-testnet.hoosmartchain.com', 'https://hoo-testnet.public.blastapi.io', 'https://rpc.ankr.com/hoo_testnet'],
  currency: {
   symbol: 'HOO',
   iconURL: 'https://cdn.brandfetch.io/idCSSGfr4Q/theme/dark/logo.svg',
  },
  explorerURL: 'https://testnet.hooscan.com',
 },
 {
  name: 'Emerald Paratime (Oasis Network) - Mainnet',
  chainID: 42262,
  rpcURLs: ['https://emerald.oasis.dev', 'https://emerald-mainnet.public.blastapi.io', 'https://rpc.ankr.com/oasis_emerald'],
  currency: {
   symbol: 'ROSE',
   iconURL: 'https://cryptologos.cc/logos/oasis-network-rose-logo.svg',
  },
  explorerURL: 'https://explorer.emerald.oasis.dev',
 },
 {
  name: 'Emerald Paratime (Oasis Network) - Testnet',
  chainID: 42261,
  rpcURLs: ['https://testnet.emerald.oasis.dev', 'https://emerald-testnet.public.blastapi.io', 'https://rpc.ankr.com/oasis_emerald_testnet'],
  currency: {
   symbol: 'ROSE',
   iconURL: 'https://cryptologos.cc/logos/oasis-network-rose-logo.svg',
  },
  explorerURL: 'https://testnet.explorer.emerald.oasis.dev',
 },
 {
  name: 'Songbird - Mainnet',
  chainID: 19,
  rpcURLs: ['https://songbird-api.flare.network/ext/C/rpc', 'https://songbird.public.blastapi.io', 'https://rpc.ankr.com/songbird'],
  currency: {
   symbol: 'SGB',
   iconURL: 'https://assets.kraken.com/marketing/web/icons/sym-sgb_colored.svg',
  },
  explorerURL: 'https://songbird-explorer.flare.network',
 },
 {
  name: 'Songbird - Testnet',
  chainID: 16,
  rpcURLs: ['https://songbird-testnet.flare.network/ext/C/rpc', 'https://songbird-testnet.public.blastapi.io', 'https://rpc.ankr.com/songbird_testnet'],
  currency: {
   symbol: 'SGB',
   iconURL: 'https://assets.kraken.com/marketing/web/icons/sym-sgb_colored.svg',
  },
  explorerURL: 'https://songbird-testnet-explorer.flare.network',
 },
 {
  name: 'OKXChain - Mainnet',
  chainID: 66,
  rpcURLs: ['https://exchainrpc.okex.org', 'https://okc-mainnet.public.blastapi.io', 'https://rpc.ankr.com/okxchain'],
  currency: {
   symbol: 'OKT',
   iconURL: 'https://cryptologos.cc/logos/okb-okb-logo.svg',
  },
  explorerURL: 'https://www.oklink.com/en/okc',
 },
 {
  name: 'OKXChain - Testnet',
  chainID: 65,
  rpcURLs: ['https://exchaintestrpc.okex.org', 'https://okc-testnet.public.blastapi.io', 'https://rpc.ankr.com/okxchain_testnet'],
  currency: {
   symbol: 'OKT',
   iconURL: 'https://cryptologos.cc/logos/okb-okb-logo.svg',
  },
  explorerURL: 'https://www.oklink.com/en/okc-test',
 },
 {
  name: 'Smart Bitcoin Cash (SmartBCH) - Mainnet',
  chainID: 10000,
  rpcURLs: ['https://smartbch.greyh.at', 'https://rpc.smartbch.org', 'https://smartbch.fountainhead.cash/mainnet'],
  currency: {
   symbol: 'BCH',
   iconURL: 'https://cryptologos.cc/logos/bitcoin-cash-bch-logo.svg',
  },
  explorerURL: 'https://www.smartscan.cash',
 },
 {
  name: 'Smart Bitcoin Cash (SmartBCH) - Testnet',
  chainID: 10001,
  rpcURLs: ['https://rpc-testnet.smartbch.org', 'https://smartbch-testnet.fountainhead.cash'],
  currency: {
   symbol: 'BCH',
   iconURL: 'https://cryptologos.cc/logos/bitcoin-cash-bch-logo.svg',
  },
  explorerURL: 'https://www.smartscan.cash/testnet',
 },
 {
  name: 'Wanchain - Mainnet',
  chainID: 888,
  rpcURLs: ['https://gwan-ssl.wandevs.org:56891', 'https://wanchain-mainnet.public.blastapi.io', 'https://rpc.ankr.com/wanchain'],
  currency: {
   symbol: 'WAN',
   iconURL: 'https://cryptologos.cc/logos/wanchain-wan-logo.svg',
  },
  explorerURL: 'https://www.wanscan.org',
 },
 {
  name: 'Wanchain - Testnet',
  chainID: 999,
  rpcURLs: ['https://gwan-ssl.wandevs.org:46891', 'https://wanchain-testnet.public.blastapi.io', 'https://rpc.ankr.com/wanchain_testnet'],
  currency: {
   symbol: 'WAN',
   iconURL: 'https://cryptologos.cc/logos/wanchain-wan-logo.svg',
  },
  explorerURL: 'https://testnet.wanscan.org',
 },
 {
  name: 'Palm Network - Mainnet',
  chainID: 11297108109,
  rpcURLs: ['https://palm-mainnet.infura.io/v3/YOUR-PROJECT-ID', 'https://palm-mainnet.public.blastapi.io', 'https://rpc.ankr.com/palm'],
  currency: {
   symbol: 'PALM',
   iconURL: 'https://svgur.com/i/1BBJ.svg',
  },
  explorerURL: 'https://explorer.palm.io',
 },
 {
  name: 'Palm Network - Testnet',
  chainID: 11297108099,
  rpcURLs: ['https://palm-testnet.infura.io/v3/YOUR-PROJECT-ID', 'https://palm-testnet.public.blastapi.io', 'https://rpc.ankr.com/palm_testnet'],
  currency: {
   symbol: 'PALM',
   iconURL: 'https://svgur.com/i/1BBJ.svg',
  },
  explorerURL: 'https://explorer.palm.io',
 },
 {
  name: 'Kava EVM - Mainnet',
  chainID: 2222,
  rpcURLs: ['https://evm.kava.io', 'https://kava-mainnet.public.blastapi.io', 'https://rpc.ankr.com/kava'],
  currency: {
   symbol: 'KAVA',
   iconURL: 'https://cryptologos.cc/logos/kava-kava-logo.svg',
  },
  explorerURL: 'https://explorer.kava.io',
 },
 {
  name: 'Kava EVM - Testnet',
  chainID: 2221,
  rpcURLs: ['https://evm.testnet.kava.io', 'https://kava-testnet.public.blastapi.io', 'https://rpc.ankr.com/kava_testnet'],
  currency: {
   symbol: 'KAVA',
   iconURL: 'https://cryptologos.cc/logos/kava-kava-logo.svg',
  },
  explorerURL: 'https://explorer.testnet.kava.io',
 },
 {
  name: 'Evmos - Mainnet',
  chainID: 9001,
  rpcURLs: ['https://evmos-rpc.evmos.org', 'https://evmos-mainnet.public.blastapi.io', 'https://rpc.ankr.com/evmos'],
  currency: {
   symbol: 'EVMOS',
   iconURL: 'https://docs.evmos.org/img/evmos.svg',
  },
  explorerURL: 'https://evm.evmos.org',
 },
 {
  name: 'Evmos - Testnet',
  chainID: 9000,
  rpcURLs: ['https://rpc.testnet.evmos.org', 'https://evmos-testnet.public.blastapi.io', 'https://rpc.ankr.com/evmos_testnet'],
  currency: {
   symbol: 'EVMOS',
   iconURL: 'https://docs.evmos.org/img/evmos.svg',
  },
  explorerURL: 'https://testnet.evmos.org',
 },
 {
  name: 'BitTorrent Chain (BTTC) - Mainnet',
  chainID: 199,
  rpcURLs: ['https://rpc.bittorrentchain.io', 'https://bttc-mainnet.public.blastapi.io', 'https://rpc.ankr.com/bttc'],
  currency: {
   symbol: 'BTT',
   iconURL: 'https://cryptologos.cc/logos/bittorrent-btt-logo.svg',
  },
  explorerURL: 'https://bttcscan.com',
 },
 {
  name: 'BitTorrent Chain (BTTC) - Testnet',
  chainID: 1028,
  rpcURLs: ['https://test-rpc.bittorrentchain.io', 'https://bttc-testnet.public.blastapi.io', 'https://rpc.ankr.com/bttc_testnet'],
  currency: {
   symbol: 'BTT',
   iconURL: 'https://cryptologos.cc/logos/bittorrent-btt-logo.svg',
  },
  explorerURL: 'https://testnet.bttcscan.com',
 },
 {
  name: 'Edgeware - Mainnet',
  chainID: 2021,
  rpcURLs: ['https://mainnet1.edgewa.re', 'https://edgeware-mainnet.public.blastapi.io', 'https://rpc.ankr.com/edgeware'],
  currency: {
   symbol: 'EDG',
   iconURL: 'https://www.edgeware.io/assets/press/edgeware-main-logomark.svg',
  },
  explorerURL: 'https://edgscan.live',
 },
 {
  name: 'SX Network - Mainnet',
  chainID: 416,
  rpcURLs: ['https://rpc.sx.technology', 'https://sx-mainnet.public.blastapi.io', 'https://rpc.ankr.com/sxnetwork'],
  currency: {
   symbol: 'SX',
   iconURL: 'https://svgshare.com/i/1BBS.svg',
  },
  explorerURL: 'https://explorer.sx.technology',
 },
 {
  name: 'Clover Finance - Mainnet',
  chainID: 1024,
  rpcURLs: ['https://rpc.clover.finance', 'https://clover-mainnet.public.blastapi.io', 'https://rpc.ankr.com/clover'],
  currency: {
   symbol: 'CLV',
   iconURL: 'https://assets.kraken.com/marketing/web/icons/sym-clv_colored.svg',
  },
  explorerURL: 'https://cloverexplorer.com',
 },
 {
  name: 'Clover Finance - Testnet',
  chainID: 1234,
  rpcURLs: ['https://testnet.clover.finance/rpc', 'https://rpc.ankr.com/clover_testnet'],
  currency: {
   symbol: 'tCLV',
   iconURL: 'https://assets.kraken.com/marketing/web/icons/sym-clv_colored.svg',
  },
  explorerURL: 'https://testnet.cloverexplorer.com',
 },
 {
  name: 'Meter.io - Mainnet',
  chainID: 82,
  rpcURLs: ['https://rpc.meter.io', 'https://meter-mainnet.public.blastapi.io', 'https://rpc.ankr.com/meter'],
  currency: {
   symbol: 'MTR',
   iconURL: 'https://svgshare.com/i/1BCE.svg',
  },
  explorerURL: 'https://scan.meter.io',
 },
 {
  name: 'Ontology EVM - Mainnet',
  chainID: 58,
  rpcURLs: ['https://dappnode1.ont.io:10339', 'https://ont-mainnet.public.blastapi.io', 'https://rpc.ankr.com/ontology'],
  currency: {
   symbol: 'ONT',
   iconURL: 'https://cryptologos.cc/logos/ontology-ont-logo.svg',
  },
  explorerURL: 'https://explorer.ont.io',
 },
 {
  name: 'Elastos EVM - Mainnet',
  chainID: 20,
  rpcURLs: ['https://api.elastos.io/evm', 'https://elastos-mainnet.public.blastapi.io', 'https://rpc.ankr.com/elastos'],
  currency: {
   symbol: 'ELA',
   iconURL: 'https://cryptologos.cc/logos/elastos-ela-logo.svg',
  },
  explorerURL: 'https://explorer.elastos.org',
 },
 {
  name: 'Elastos EVM - Testnet',
  chainID: 21,
  rpcURLs: ['https://api-testnet.elastos.io/evm', 'https://elastos-testnet.public.blastapi.io', 'https://rpc.ankr.com/elastos_testnet'],
  currency: {
   symbol: 'tELA',
   iconURL: 'https://cryptologos.cc/logos/elastos-ela-logo.svg',
  },
  explorerURL: 'https://testnet.explorer.elastos.org',
 },
 {
  name: 'Godwoken (Nervos Layer 2) - Mainnet',
  chainID: 71393,
  rpcURLs: ['https://godwoken-mainnet-v1.ckbapp.dev', 'https://godwoken-mainnet.public.blastapi.io', 'https://rpc.ankr.com/godwoken'],
  currency: {
   symbol: 'CKB',
   iconURL: 'https://cryptologos.cc/logos/nervos-network-ckb-logo.svg',
  },
  explorerURL: 'https://explorer.nervos.org',
 },
 {
  name: 'Godwoken (Nervos Layer 2) - Testnet',
  chainID: 71401,
  rpcURLs: ['https://godwoken-testnet-v1.ckbapp.dev', 'https://godwoken-testnet.public.blastapi.io', 'https://rpc.ankr.com/godwoken_testnet'],
  currency: {
   symbol: 'CKB',
   iconURL: 'https://cryptologos.cc/logos/nervos-network-ckb-logo.svg',
  },
  explorerURL: 'https://explorer.testnet.nervos.org',
 },
 {
  name: 'REI Network - Mainnet',
  chainID: 47805,
  rpcURLs: ['https://rei-rpc.meter.io', 'https://rei-mainnet.public.blastapi.io', 'https://rpc.ankr.com/rei'],
  currency: {
   symbol: 'REI',
   iconURL: 'https://svgshare.com/i/1BAn.svg',
  },
  explorerURL: 'https://scan.rei.network',
 },
 {
  name: 'REI Network - Testnet',
  chainID: 47905,
  rpcURLs: ['https://testnet-rpc.rei.network', 'https://rei-testnet.public.blastapi.io', 'https://rpc.ankr.com/rei_testnet'],
  currency: {
   symbol: 'tREI',
   iconURL: 'https://svgshare.com/i/1BAn.svg',
  },
  explorerURL: 'https://scan-testnet.rei.network',
 },
 {
  name: 'Shiden Network - Mainnet',
  chainID: 336,
  rpcURLs: ['https://rpc.shiden.astar.network', 'https://shiden-mainnet.public.blastapi.io', 'https://rpc.ankr.com/shiden'],
  currency: {
   symbol: 'SDN',
   iconURL: 'https://revoke.cash/assets/images/vendor/chains/shiden.svg',
  },
  explorerURL: 'https://shiden.subscan.io',
 },
 {
  name: 'Shiden Network - Shibuya Testnet',
  chainID: 81,
  rpcURLs: ['https://rpc.shibuya.astar.network', 'https://shibuya-testnet.public.blastapi.io', 'https://rpc.ankr.com/shibuya_testnet'],
  currency: {
   symbol: 'tSDN',
   iconURL: 'https://revoke.cash/assets/images/vendor/chains/shiden.svg',
  },
  explorerURL: 'https://testnet.subscan.io/shibuya',
 },
 {
  name: 'Boba Network - Mainnet',
  chainID: 288,
  rpcURLs: ['https://mainnet.boba.network', 'https://boba-mainnet.public.blastapi.io', 'https://rpc.ankr.com/boba'],
  currency: {
   symbol: 'BOBA',
   iconURL: 'https://svgshare.com/i/1BCR.svg',
  },
  explorerURL: 'https://blockexplorer.boba.network',
 },
 {
  name: 'Boba Network - Testnet',
  chainID: 28,
  rpcURLs: ['https://testnet.boba.network', 'https://boba-testnet.public.blastapi.io', 'https://rpc.ankr.com/boba_testnet'],
  currency: {
   symbol: 'BOBA',
   iconURL: 'https://svgshare.com/i/1BCR.svg',
  },
  explorerURL: 'https://testnet.blockexplorer.boba.network',
 },
 {
  name: 'Syscoin NEVM - Mainnet',
  chainID: 57,
  rpcURLs: ['https://rpc.syscoin.org', 'https://syscoin-mainnet.public.blastapi.io', 'https://rpc.ankr.com/syscoin'],
  currency: {
   symbol: 'SYS',
   iconURL: 'https://cryptologos.cc/logos/syscoin-sys-logo.svg',
  },
  explorerURL: 'https://explorer.syscoin.org',
 },
 {
  name: 'Syscoin NEVM - Testnet',
  chainID: 5700,
  rpcURLs: ['https://rpc.tanenbaum.io', 'https://syscoin-testnet.public.blastapi.io', 'https://rpc.ankr.com/syscoin_testnet'],
  currency: {
   symbol: 'tSYS',
   iconURL: 'https://cryptologos.cc/logos/syscoin-sys-logo.svg',
  },
  explorerURL: 'https://explorer.tanenbaum.io',
 },
 {
  name: 'Huobi ECO Chain - Mainnet',
  chainID: 128,
  rpcURLs: ['https://http-mainnet.hecochain.com', 'https://heco.rpc.thirdweb.com', 'https://rpc.ankr.com/heco'],
  currency: {
   symbol: 'HT',
   iconURL: 'https://cryptologos.cc/logos/huobi-token-ht-logo.svg',
  },
  explorerURL: 'https://hecoinfo.com',
 },
 {
  name: 'Huobi ECO Chain - Testnet',
  chainID: 256,
  rpcURLs: ['https://http-testnet.hecochain.com', 'https://testnet.heco.rpc.thirdweb.com', 'https://rpc.ankr.com/heco_testnet'],
  currency: {
   symbol: 'HT',
   iconURL: 'https://cryptologos.cc/logos/huobi-token-ht-logo.svg',
  },
  explorerURL: 'https://testnet.hecoinfo.com',
 },
 {
  name: 'TomoChain - Mainnet',
  chainID: 88,
  rpcURLs: ['https://rpc.tomochain.com', 'https://tomochain-rpc.com'],
  currency: {
   symbol: 'TOMO',
   iconURL: 'https://cryptologos.cc/logos/tomochain-tomo-logo.svg',
  },
  explorerURL: 'https://scan.tomochain.com',
 },
 {
  name: 'TomoChain - Testnet',
  chainID: 89,
  rpcURLs: ['https://rpc-testnet.tomochain.com'],
  currency: {
   symbol: 'tTOMO',
   iconURL: 'https://cryptologos.cc/logos/tomochain-tomo-logo.svg',
  },
  explorerURL: 'https://scan-testnet.tomochain.com',
 },
 {
  name: 'Canto - Mainnet',
  chainID: 7700,
  rpcURLs: ['https://canto.slingshot.finance/rpc', 'https://rpc.ankr.com/canto'],
  currency: {
   symbol: 'CANTO',
   iconURL: 'https://www.airslate.com/preview/explorebots/content-management/canto.svg',
  },
  explorerURL: 'https://evm.explorer.canto.io',
 },
 {
  name: 'Canto - Testnet',
  chainID: 740,
  rpcURLs: ['https://canto-testnet-rpc.com', 'https://rpc.ankr.com/canto_testnet'],
  currency: {
   symbol: 'tCANTO',
   iconURL: 'https://www.airslate.com/preview/explorebots/content-management/canto.svg',
  },
  explorerURL: 'https://testnet.evm.explorer.canto.io',
 },
 {
  name: 'Canto - Kovan Testnet',
  chainID: 42,
  rpcURLs: ['https://kovan.canto.io/rpc', 'https://rpc.ankr.com/canto_kovan'],
  currency: {
   symbol: 'kCANTO',
   iconURL: 'https://www.airslate.com/preview/explorebots/content-management/canto.svg',
  },
  explorerURL: 'https://kovan.evm.explorer.canto.io',
 },
 {
  name: 'Energy Web Chain (EWC) - Mainnet',
  chainID: 246,
  rpcURLs: ['https://rpc.energyweb.org', 'https://mainnet.infura.io/v3/YOUR-PROJECT-ID'],
  currency: {
   symbol: 'EWT',
   iconURL: 'https://cryptologos.cc/logos/energy-web-token-ewt-logo.svg',
  },
  explorerURL: 'https://explorer.energyweb.org',
 },
 {
  name: 'Conflux EVM - Mainnet',
  chainID: 1030,
  rpcURLs: ['https://evm.confluxrpc.com', 'https://rpc.ankr.com/conflux'],
  currency: {
   symbol: 'CFX',
   iconURL: 'https://cryptologos.cc/logos/conflux-network-cfx-logo.svg',
  },
  explorerURL: 'https://www.confluxscan.io',
 },
 {
  name: 'IoTeX - Mainnet',
  chainID: 4689,
  rpcURLs: ['https://babel-api.mainnet.iotex.io', 'https://rpc.ankr.com/iotex'],
  currency: {
   symbol: 'IOTX',
   iconURL: 'https://cryptologos.cc/logos/iotex-iotx-logo.svg',
  },
  explorerURL: 'https://iotexscan.io',
 },
 {
  name: 'WAX EVM - Mainnet',
  chainID: 2001,
  rpcURLs: ['https://waxevm-rpc.com', 'https://rpc.ankr.com/wax_evm'],
  currency: {
   symbol: 'WAX',
   iconURL: 'https://cryptologos.cc/logos/wax-wax-logo.svg',
  },
  explorerURL: 'https://evm.explorer.wax.io',
 },
 {
  name: 'Polygon zkEVM - Mainnet',
  chainID: 1101,
  rpcURLs: ['https://polygon-zkevm.publicnode.com', 'https://rpc.ankr.com/polygon_zkevm'],
  currency: {
   symbol: 'MATIC',
   iconURL: 'https://cryptologos.cc/logos/polygon-matic-logo.svg',
  },
  explorerURL: 'https://zkevm.polygonscan.com',
 },
 {
  name: 'Polygon zkEVM - Testnet',
  chainID: 1442,
  rpcURLs: ['https://polygon-zkevm-testnet.publicnode.com', 'https://rpc.ankr.com/polygon_zkevm_testnet'],
  currency: {
   symbol: 'MATIC',
   iconURL: 'https://cryptologos.cc/logos/polygon-matic-logo.svg',
  },
  explorerURL: 'https://testnet.polygonscan.com',
 },
 {
  name: 'Scroll - Mainnet',
  chainID: 534354,
  rpcURLs: ['https://mainnet-rpc.scroll.io/l2', 'https://rpc.ankr.com/scroll_mainnet'],
  currency: {
   symbol: 'ETH',
   iconURL: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
  },
  explorerURL: 'https://mainnet.blockscout.scroll.io',
 },
 {
  name: 'Scroll - Testnet',
  chainID: 534353,
  rpcURLs: ['https://alpha-rpc.scroll.io/l2', 'https://rpc.ankr.com/scroll_testnet'],
  currency: {
   symbol: 'ETH',
   iconURL: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
  },
  explorerURL: 'https://blockscout.scroll.io',
 },
 {
  name: 'Base - Mainnet',
  chainID: 84531,
  rpcURLs: ['https://base-mainnet.infura.io/v3/YOUR-PROJECT-ID', 'https://rpc.base.org'],
  currency: {
   symbol: 'ETH',
   iconURL: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
  },
  explorerURL: 'https://basescan.org',
 },
 {
  name: 'Base - Testnet',
  chainID: 84531,
  rpcURLs: ['https://base-goerli.infura.io/v3/YOUR-PROJECT-ID', 'https://rpc.testnet.base.org'],
  currency: {
   symbol: 'ETH',
   iconURL: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
  },
  explorerURL: 'https://goerli.basescan.org',
 },
 {
  name: 'Linea - Mainnet',
  chainID: 59144,
  rpcURLs: ['https://rpc.linea.build', 'https://linea-rpc.ankr.com'],
  currency: {
   symbol: 'ETH',
   iconURL: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
  },
  explorerURL: 'https://explorer.linea.build',
 },
 {
  name: 'Linea - Testnet',
  chainID: 59140,
  rpcURLs: ['https://rpc.testnet.linea.build', 'https://linea-testnet-rpc.ankr.com'],
  currency: {
   symbol: 'ETH',
   iconURL: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
  },
  explorerURL: 'https://testnet.explorer.linea.build',
 },
 {
  name: 'Shardeum - Mainnet',
  chainID: 8081,
  rpcURLs: ['https://rpc.shardeum.org'],
  currency: {
   symbol: 'SHM',
   iconURL: 'https://svgshare.com/i/1BB2.svg',
  },
  explorerURL: 'https://explorer.shardeum.org',
 },
 {
  name: 'Shardeum - Testnet',
  chainID: 8080,
  rpcURLs: ['https://rpc.testnet.shardeum.org'],
  currency: {
   symbol: 'tSHM',
   iconURL: 'https://svgshare.com/i/1BB2.svg',
  },
  explorerURL: 'https://testnet.explorer.shardeum.org',
 },
 {
  name: 'Theta Network - Mainnet',
  chainID: 361,
  rpcURLs: ['https://mainnet-rpc.theta.network', 'https://theta-rpc.com'],
  currency: {
   symbol: 'THETA',
   iconURL: 'https://cryptologos.cc/logos/theta-network-theta-logo.svg',
  },
  explorerURL: 'https://explorer.thetatoken.org',
 },
 {
  name: 'Theta Network - Testnet',
  chainID: 365,
  rpcURLs: ['https://testnet-rpc.theta.network', 'https://theta-testnet-rpc.com'],
  currency: {
   symbol: 'THETA',
   iconURL: 'https://cryptologos.cc/logos/theta-network-theta-logo.svg',
  },
  explorerURL: 'https://testnet.explorer.thetatoken.org',
 },
 {
  name: 'Mantle - Mainnet',
  chainID: 5001,
  rpcURLs: ['https://rpc.mantle.xyz', 'https://mantle-mainnet.public.blastapi.io'],
  currency: {
   symbol: 'MNT',
   iconURL: 'https://cryptologos.cc/logos/mantle-mnt-logo.svg',
  },
  explorerURL: 'https://explorer.mantle.xyz',
 },
 {
  name: 'Mantle - Testnet',
  chainID: 5000,
  rpcURLs: ['https://rpc.testnet.mantle.xyz', 'https://mantle-testnet.public.blastapi.io'],
  currency: {
   symbol: 'tMNT',
   iconURL: 'https://cryptologos.cc/logos/mantle-mnt-logo.svg',
  },
  explorerURL: 'https://testnet.explorer.mantle.xyz',
 },
 {
  name: 'zkSpace - Mainnet',
  chainID: 54321,
  rpcURLs: ['https://rpc.zkspace.com', 'https://mainnet.zkspace.public.blastapi.io'],
  currency: {
   symbol: 'ZKS',
   iconURL: 'https://svgshare.com/i/1BAo.svg',
  },
  explorerURL: 'https://explorer.zkspace.com',
 },
 {
  name: 'zkSpace - Testnet',
  chainID: 54322,
  rpcURLs: ['https://testnet-rpc.zkspace.com', 'https://testnet.zkspace.public.blastapi.io'],
  currency: {
   symbol: 'tZKS',
   iconURL: 'https://svgshare.com/i/1BAo.svg',
  },
  explorerURL: 'https://testnet.explorer.zkspace.com',
 },
 {
  name: 'Taiko - Mainnet',
  chainID: 167002,
  rpcURLs: ['https://mainnet.taiko.xyz/rpc', 'https://taiko-mainnet.public.blastapi.io'],
  currency: {
   symbol: 'TAIKO',
   iconURL: 'https://user-images.githubusercontent.com/13951458/230506906-474e42f7-00e8-478b-9edc-c127ed97f83e.svg',
  },
  explorerURL: 'https://explorer.taiko.xyz',
 },
 {
  name: 'Taiko - Testnet',
  chainID: 167001,
  rpcURLs: ['https://testnet.taiko.xyz/rpc', 'https://taiko-testnet.public.blastapi.io'],
  currency: {
   symbol: 'tTAIKO',
   iconURL: 'https://user-images.githubusercontent.com/13951458/230506906-474e42f7-00e8-478b-9edc-c127ed97f83e.svg',
  },
  explorerURL: 'https://testnet.explorer.taiko.xyz',
 },
 {
  name: 'Constellation (Hypergraph) - Mainnet',
  chainID: 421620,
  rpcURLs: ['https://api.constellation.network/rpc', 'https://rpc.constellation.network'],
  currency: {
   symbol: 'DAG',
   iconURL: 'https://svgshare.com/i/1BB_.svg',
  },
  explorerURL: 'https://explorer.constellation.network',
 },
 {
  name: 'Constellation (Hypergraph) - Testnet',
  chainID: 421620,
  rpcURLs: ['https://rpc.testnet.constellation.network', 'https://constellation-testnet.public.blastapi.io'],
  currency: {
   symbol: 'DAG',
   iconURL: 'https://svgshare.com/i/1BB_.svg',
  },
  explorerURL: 'https://explorer.testnet.constellation.network',
 },
 {
  name: 'Clover Finance - Arbitrum - Mainnet',
  chainID: 42162,
  rpcURLs: ['https://clover-arbitrum.rpc.com', 'https://clover-arbitrum.public.blastapi.io'],
  currency: {
   symbol: 'CLV',
   iconURL: 'https://assets.kraken.com/marketing/web/icons/sym-clv_colored.svg',
  },
  explorerURL: 'https://explorer.clover.finance/arbitrum',
 },
 {
  name: 'Clover Finance - Arbitrum - Testnet',
  chainID: 421611,
  rpcURLs: ['https://clover-arbitrum-testnet.rpc.com', 'https://clover-arbitrum-testnet.public.blastapi.io'],
  currency: {
   symbol: 'tCLV',
   iconURL: 'https://assets.kraken.com/marketing/web/icons/sym-clv_colored.svg',
  },
  explorerURL: 'https://explorer.clover.finance/arbitrum/testnet',
 },
 {
  name: 'Zora - Mainnet',
  chainID: 1337,
  rpcURLs: ['https://rpc.zora.network', 'https://zora-mainnet.public.blastapi.io'],
  currency: {
   symbol: 'ZORA',
   iconURL: 'https://svgshare.com/i/1BAL.svg',
  },
  explorerURL: 'https://explorer.zora.network',
 },
 {
  name: 'Zora - Testnet',
  chainID: 1338,
  rpcURLs: ['https://rpc.testnet.zora.network', 'https://zora-testnet.public.blastapi.io'],
  currency: {
   symbol: 'tZORA',
   iconURL: 'https://svgshare.com/i/1BAL.svg',
  },
  explorerURL: 'https://explorer.testnet.zora.network',
 },
]);
